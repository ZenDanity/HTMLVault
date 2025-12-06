#!/usr/bin/env python3
"""
HTMLVault Build Script
Combines all separate CSS and JS files into a single HTML file.
"""

import os
import re
import base64
import argparse
from pathlib import Path


def read_file(filepath):
    """Read and return the contents of a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None


def read_binary_file(filepath):
    """Read and return the binary contents of a file."""
    try:
        with open(filepath, 'rb') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading binary file {filepath}: {e}")
        return None


def get_mime_type(filepath):
    """Get MIME type based on file extension."""
    ext = os.path.splitext(filepath)[1].lower()
    mime_types = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.webp': 'image/webp'
    }
    return mime_types.get(ext, 'application/octet-stream')


def image_to_base64(filepath):
    """Convert an image file to a base64 data URI."""
    binary_data = read_binary_file(filepath)
    if binary_data is None:
        return None
    
    mime_type = get_mime_type(filepath)
    base64_data = base64.b64encode(binary_data).decode('utf-8')
    return f"data:{mime_type};base64,{base64_data}"


def escape_for_js_string(html_content):
    """Escape HTML content to be safe inside a JavaScript template string."""
    # First escape backslashes
    html_content = html_content.replace('\\', '\\\\')
    # Then escape backticks
    html_content = html_content.replace('`', '\\`')
    # Escape template literal syntax
    html_content = html_content.replace('${', '\\${')
    # Escape script tags to prevent conflicts
    html_content = html_content.replace('</script>', '<\\/script>')
    return html_content


def replace_html_templates(js_content, src_dir):
    """Replace HTML template placeholders with actual HTML file contents."""
    html_dir = os.path.join(src_dir, 'html')
    
    # Map of placeholder to file
    templates = {
        'HTML_TEMPLATE_CREDENTIALS': 'credentials.html',
        'HTML_TEMPLATE_TEXTAREA': 'textarea.html',
        'HTML_TEMPLATE_IMAGE': 'image.html'
    }
    
    for placeholder, filename in templates.items():
        html_path = os.path.join(html_dir, filename)
        html_content = read_file(html_path)
        
        if html_content:
            print(f"  → Embedding template: {filename}")
            # Escape for JS template string
            # First escape backslashes, then backticks, then template literals
            escaped_content = html_content.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
            # Escape closing tags to prevent breaking out of script/style blocks
            escaped_content = escaped_content.replace('</script>', '<\\/script>')
            escaped_content = escaped_content.replace('</style>', '<\\/style>')
            js_content = js_content.replace(f'`{placeholder}`', f'`{escaped_content}`')
        else:
            print(f"  ⚠ Warning: Could not read template: {html_path}")
    
    return js_content


def replace_help_modal(html_content, src_dir):
    """Replace help modal placeholder with actual help HTML content."""
    html_dir = os.path.join(src_dir, 'html')
    help_path = os.path.join(html_dir, 'help.html')
    help_content = read_file(help_path)
    
    if help_content:
        print(f"  → Embedding help modal: help.html")
        
        # Process img tags in help content
        def replace_img_in_help(match):
            full_tag = match.group(0)
            src = match.group(1) or match.group(2)
            
            if not src:
                return full_tag
            
            img_path = os.path.join(src_dir, src)
            
            if os.path.exists(img_path):
                data_uri = image_to_base64(img_path)
                if data_uri:
                    new_tag = re.sub(r'\sreplace\s?', ' ', full_tag)
                    new_tag = re.sub(r'src="[^"]+"', f'src="{data_uri}"', new_tag)
                    return new_tag
                else:
                    return full_tag.replace(' replace', '').replace('replace ', '')
            else:
                return ''
        
        # Replace img tags in help content
        help_content = re.sub(
            r'<img[^>]*?\sreplace[^>]*?\ssrc="([^"]+)"[^>]*?>|<img[^>]*?\ssrc="([^"]+)"[^>]*?\sreplace[^>]*?>',
            replace_img_in_help,
            help_content
        )
        
        # Replace placeholder with processed help content
        html_content = html_content.replace('HTML_HELP_MODAL', help_content)
    
    return html_content


def write_file(filepath, content):
    """Write content to a file."""
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Successfully wrote to {filepath}")
        return True
    except Exception as e:
        print(f"Error writing {filepath}: {e}")
        return False


def get_next_available_filename(base_path, allow_overwrite=False):
    """Get the next available filename by adding _001, _002, etc. if file exists.
    
    Args:
        base_path: The desired output file path
        allow_overwrite: If True, return base_path even if it exists
    """
    if allow_overwrite:
        if os.path.exists(base_path):
            print(f"⚠ Warning: {os.path.basename(base_path)} exists and will be overwritten")
        return base_path
    
    if not os.path.exists(base_path):
        return base_path
    
    # File exists, find next available version
    directory = os.path.dirname(base_path)
    filename = os.path.basename(base_path)
    name, ext = os.path.splitext(filename)
    
    counter = 1
    while True:
        new_filename = f"{name}_{counter:03d}{ext}"
        new_path = os.path.join(directory, new_filename)
        if not os.path.exists(new_path):
            print(f"⚠ Warning: {filename} already exists!")
            print(f"  Saving as: {new_filename}")
            return new_path
        counter += 1
        if counter > 999:  # Safety limit
            raise Exception("Too many versions of the file exist (>999)")


def inline_resources(html_content, src_dir):
    """
    Replace all <link> and <script> tags with 'replace' attribute
    with inlined content from their respective files.
    """
    
    # Process <link replace> tags (CSS files)
    def replace_css_link(match):
        href = match.group(1)
        css_path = os.path.join(src_dir, href)
        
        css_content = read_file(css_path)
        if css_content is None:
            print(f"⚠ Warning: Could not read CSS file: {css_path}")
            return match.group(0)  # Return original tag if file not found
        
        print(f"  → Inlining CSS: {href}")
        return f'<style type="text/css">\n{css_content}\n  </style>'
    
    # Process <script replace> tags (JS files)
    def replace_js_script(match):
        src = match.group(1)
        js_path = os.path.join(src_dir, src)
        
        js_content = read_file(js_path)
        if js_content is None:
            print(f"⚠ Warning: Could not read JS file: {js_path}")
            return match.group(0)  # Return original tag if file not found
        
        print(f"  → Inlining JS: {src}")
        
        # Replace HTML template placeholders in app.js
        if 'app.js' in src.lower():
            print(f"  → Processing HTML templates in {src}")
            js_content = replace_html_templates(js_content, src_dir)
        
        return f'<script type="text/javascript">\n{js_content}\n  </script>'
    
    # Process <link replace> for favicon (convert to data URI if needed)
    def replace_favicon_link(match):
        href = match.group(1)
        
        # If it's already a data URI, keep it as is
        if href.startswith('data:'):
            return match.group(0).replace(' replace', '')
        
        # Try to read and convert the file to base64
        favicon_path = os.path.join(src_dir, href)
        if os.path.exists(favicon_path):
            print(f"  → Encoding favicon to base64: {href}")
            data_uri = image_to_base64(favicon_path)
            if data_uri:
                # Return the link tag with base64 data URI
                return f'<link rel="icon" type="image/png" href="{data_uri}">'
            else:
                print(f"  ⚠ Failed to encode favicon")
                return match.group(0).replace(' replace', '')
        else:
            print(f"⚠ Warning: Favicon not found: {favicon_path}")
            # Remove the tag entirely if file not found
            return ''
    
    # Process <img replace> tags (convert to base64)
    def replace_img_tag(match):
        full_tag = match.group(0)
        src = match.group(1)
        
        # If it's already a data URI, just remove the replace attribute
        if src.startswith('data:'):
            return full_tag.replace(' replace', '').replace('replace ', '')
        
        # Try to read and convert the file to base64
        img_path = os.path.join(src_dir, src)
        if os.path.exists(img_path):
            print(f"  → Encoding image to base64: {src}")
            data_uri = image_to_base64(img_path)
            if data_uri:
                # Replace src with data URI and remove replace attribute
                new_tag = full_tag.replace(f'src="{src}"', f'src="{data_uri}"')
                new_tag = new_tag.replace(' replace', '').replace('replace ', '')
                return new_tag
            else:
                print(f"  ⚠ Failed to encode image: {src}")
                # Remove replace attribute but keep original src
                return full_tag.replace(' replace', '').replace('replace ', '')
        else:
            print(f"⚠ Warning: Image not found: {img_path}")
            # Remove the tag entirely if file not found
            return ''
    
    # Replace CSS links
    html_content = re.sub(
        r'<link replace rel="stylesheet" type="text/css" href="([^"]+)"\s*/?>',
        replace_css_link,
        html_content
    )
    
    # Replace JS scripts
    html_content = re.sub(
        r'<script replace type="text/javascript" src="([^"]+)"></script>',
        replace_js_script,
        html_content
    )
    
    # Replace favicon link
    html_content = re.sub(
        r'<link replace rel="icon" type="image/png" href="([^"]+)">',
        replace_favicon_link,
        html_content
    )
    
    # Replace img tags with replace attribute
    html_content = re.sub(
        r'<img[^>]*?\sreplace[^>]*?\ssrc="([^"]+)"[^>]*?>|<img[^>]*?\ssrc="([^"]+)"[^>]*?\sreplace[^>]*?>',
        lambda m: replace_img_tag(m) if m.group(1) or m.group(2) else m.group(0),
        html_content
    )
    
    # Replace help modal placeholder
    html_content = replace_help_modal(html_content, src_dir)
    
    return html_content


def build(overwrite=False):
    """Main build function.
    
    Args:
        overwrite: If True, overwrite existing HTMLVault.html
    """
    print("=" * 60)
    print("HTMLVault Build Script")
    print("=" * 60)
    
    # Define paths - build.py and all source files are in /dev folder
    script_dir = Path(__file__).parent  # This is the /dev folder
    project_dir = script_dir.parent     # This is the root folder
    src_dir = script_dir                # Source files are in /dev (same as script)
    output_dir = project_dir            # Output to root folder
    template_file = src_dir / 'index.html'
    output_file = output_dir / 'HTMLVault.html'
    
    print(f"\nScript directory:  {script_dir}")
    print(f"Project directory: {project_dir}")
    print(f"Source directory:  {src_dir}")
    print(f"Output directory:  {output_dir}")
    print(f"Template file:     {template_file}")
    print(f"Output file:       {output_file}")
    if overwrite:
        print(f"Mode:              OVERWRITE ENABLED")
    print()
    
    # Read template
    print("Reading template...")
    template_content = read_file(template_file)
    if template_content is None:
        print("✗ Failed to read template file!")
        return False
    
    print("✓ Template loaded\n")
    
    # Inline resources
    print("Inlining resources...")
    final_content = inline_resources(template_content, src_dir)
    print("✓ Resources inlined\n")
    
    # Check if output file exists and get next available filename
    print("Checking output file...")
    final_output_file = get_next_available_filename(output_file, allow_overwrite=overwrite)
    
    # Write output
    print("Writing output file...")
    success = write_file(final_output_file, final_content)
    
    if success:
        # Get file size
        file_size = os.path.getsize(final_output_file)
        file_size_kb = file_size / 1024
        
        print(f"\n{'=' * 60}")
        print(f"✓ Build complete!")
        print(f"  Output: {final_output_file}")
        print(f"  Size:   {file_size_kb:.2f} KB ({file_size:,} bytes)")
        print(f"{'=' * 60}\n")
        return True
    else:
        print("\n✗ Build failed!\n")
        return False


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Build HTMLVault - combines all source files into a single HTML file'
    )
    parser.add_argument(
        '--overwrite',
        action='store_true',
        help='Overwrite existing HTMLVault.html instead of creating versioned file'
    )
    
    args = parser.parse_args()
    success = build(overwrite=args.overwrite)
    exit(0 if success else 1)
