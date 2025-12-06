# 🔒 Store Encrypted Credentials, Images and Text in a Self-Contained HTML File

HTMLVault is a single-file, zero-dependency password vault that encrypts your sensitive data using military-grade AES-256-GCM encryption - all running locally in your browser.

![Screenshot](https://raw.githubusercontent.com/ZenDanity/HTMLVault/refs/heads/main/dev/screenshots/screenshot-02.png)

## Installation
**None!**

## Requirements
**None!**

## Quick Usage
Download the HTMLVault.html file, open it in your browser, click the "+" and encrypt the file with a password

## Features

- 🧠 **Intuitiv Usability** - Shortcuts you know, ctrl + s, encryption with "Enter", double click to change values, and much more

<br>

- 📊 **Integrated Credentials Table** - Store usernames, passwords, and notes with click-to-copy
- 🖼️ **Integrated Image Gallery** - Securely store photos and documents with drag-and-drop
- 📝 **Integrated Simple Text Area** - For notes, thoughts, or any plain text

<br>

- 📦 **Everything in one HTML file** - No dependencies, no installation
- 🖥️ **Works completely offline** - No internet required, no data leaves your device
- 🔐 **Military-grade AES-256-GCM encryption** - Your data is truly secure
- 🎨 **Modern, intuitive interface** - Clean design with dark theme
- 🔍 **Instant filtering** - Quickly find what you need
- ⌨️ **Keyboard shortcuts** - Ctrl+S to save, Ctrl+E to encrypt, and more
- 💾 **Self-contained** - Save the file anywhere, copy it, back it up
- 🆘 **Comprehensive help system** - Built-in guide for beginners and power users

### Credentials Table
- Click any cell to copy its content
- Double-click to edit in place
- Filter to quickly find entries
- Add/delete rows as needed
- Export-friendly format

![Screenshot](https://raw.githubusercontent.com/ZenDanity/HTMLVault/refs/heads/main/dev/screenshots/screenshot-05.png "Integrated image gallery")

### Image Gallery
- Drag & drop images directly into the vault
- Store images as base64 (no external files needed)
- Click thumbnails for full-screen view
- Download or delete images individually
- Supports JPG, PNG, GIF, WebP, SVG

![Screenshot](https://raw.githubusercontent.com/ZenDanity/HTMLVault/refs/heads/main/dev/screenshots/screenshot-03.png "Integrated image gallery")

### Simple Text Area
- Just write text

![Screenshot](https://raw.githubusercontent.com/ZenDanity/HTMLVault/refs/heads/main/dev/screenshots/screenshot-04.png "Integrated simple text area")

## More Detailed Usage

1. **Download** `HTMLVault.html` to your computer
2. **Open** it in your browser (double-click or right-click → Open With → Browser)
3. **Add content** by clicking the **+** button and selecting a template (Credentials, Text, or Image)
4. **Fill in your data** - add passwords, upload images, write notes
5. **Enter a password** in the password field at the top
6. **Encrypt** by clicking the lock icon or pressing Enter in the password field
7. **Save the file** (Ctrl+S or click the save button) - overwrite the original file

**Important:** Your password is the ONLY way to decrypt your data. If you forget it, your data is permanently lost. Write it down somewhere safe!

## Security Features

- **AES-256-GCM encryption** - Industry-standard encryption used by governments and militaries
- **PBKDF2 key derivation** - 100,000 iterations to protect against brute-force attacks
- **Random salts and IVs** - Each encryption is unique, even with the same password
- **No telemetry** - Zero network requests, complete privacy
- **Client-side only** - All encryption happens in your browser, nothing is sent anywhere
- **Comprehensive CSP headers** - Protection against XSS and code injection

### Intuitiv Shortcuts and Usage
- **Ctrl+S** - Save file
- **ENTER** (in password field) - Encrypt/Decrypt automatically, depending on what is needed
- **ESC** - Close modals
- **Double Click** the Title in the top left to change it, also the filename
- **Left Click** on a credential field to copy it
- **Click Out** of the an image modal or edited input field to close or save it
- And so much more intuitiv usability!

![Screenshot](https://raw.githubusercontent.com/ZenDanity/HTMLVault/refs/heads/main/dev/screenshots/screenshot-06.png "Help Screen")

## Development

HTMLVault uses a modular development structure:

```
dev/
├── src/
│   ├── index.html          # Main template
│   ├── styles/             # Modular CSS files
│   │   ├── base.css
│   │   ├── themes.css
│   │   ├── responsive.css
│   │   ├── help.css
│   │   └── image.css
│   ├── scripts/            # JavaScript modules
│   │   ├── crypto.js
│   │   └── app.js
│   └── html/               # Content templates
│       ├── credentials.html
│       ├── textarea.html
│       ├── image.html
│       └── help.html
└── build.py                # Build script

```

**To build:**
```bash
python dev/build.py --overwrite
```

This inlines all CSS, JavaScript, images, and templates into a single `HTMLVault.html` file.

## FAQ

**Q: What happens if I forget my password?**  
A: Your data is permanently lost. There is NO password recovery. This is intentional for maximum security.

**Q: Can I use this on mobile?**  
A: The interface is responsive, but mobile browsers may have limitations with file saving.

**Q: Is my data really secure?**  
A: Yes. AES-256-GCM is the same encryption used by governments and militaries. As long as you use a strong password, your data is extremely secure.

**Q: Can I sync this across devices?**  
A: HTMLVault is a single file. You can manually copy it to other devices, use cloud storage (Dropbox, Google Drive), or version control (Git).

**Q: How big can the file get?**  
A: Images increase file size significantly. A few MB is fine, but hundreds of images may cause performance issues.

**Q: Does this work offline?**  
A: Yes! 100% offline. No internet connection required at all.

## License

MIT License - See LICENSE.md for details

## Credits

- Built with modern Web Crypto API
- No external dependencies
- Created with ❤️ for privacy and security

---

**⚠️ Remember:** Always keep backups of your HTMLVault file and NEVER forget your password!
