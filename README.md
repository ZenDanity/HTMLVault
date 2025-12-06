# 🔒 Store Encrypted Information in a Self-Contained HTML File

HTMLVault is a single-file, zero-dependency password vault that encrypts your sensitive data using military-grade AES-256-GCM encryption - all running locally in your browser.

## Installation

<div align="center">
  
**Nothing!**

</div>

Just download `HTMLVault.html` and open it in any modern browser. That's it.

## Requirements

<div align="center">
  
**Nothing!**

</div>

Works in any modern browser - Chrome, Firefox, Edge, Safari. No plugins, no server, no internet connection needed.

## Features

- 🔐 **Military-grade AES-256-GCM encryption** - Your data is truly secure
- 📦 **Everything in one HTML file** - No dependencies, no installation
- 🖥️ **Works completely offline** - No internet required, no data leaves your device
- 📊 **Integrated credentials table** - Store usernames, passwords, and notes with click-to-copy
- 🖼️ **Image gallery** - Securely store photos and documents with drag-and-drop
- 📝 **Simple text area** - For notes, thoughts, or any plain text
- 🎨 **Modern, intuitive interface** - Clean design with dark theme
- 🔍 **Instant filtering** - Quickly find what you need
- ⌨️ **Keyboard shortcuts** - Ctrl+S to save, Ctrl+E to encrypt, and more
- 💾 **Self-contained** - Save the file anywhere, copy it, back it up
- 🆘 **Comprehensive help system** - Built-in guide for beginners and power users

## Usage

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

## Advanced Features

### Credentials Table
- Click any cell to copy its content
- Double-click to edit in place
- Filter to quickly find entries
- Add/delete rows as needed
- Export-friendly format

### Image Gallery
- Drag & drop images directly into the vault
- Store images as base64 (no external files needed)
- Click thumbnails for full-screen view
- Download or delete images individually
- Supports JPG, PNG, GIF, WebP, SVG

### Keyboard Shortcuts
- **Ctrl+S** - Save file
- **Ctrl+E** - Encrypt/Decrypt
- **Ctrl+D** - Toggle dark/light theme
- **Enter** (in password field) - Encrypt/Decrypt
- **ESC** - Close modals

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

1. When you reopen the file, you see the encrypted content. type your password in the password field and hit enter or press decrypt, to see your list again.

### Tips & Hints
* If you messed something up, just hit **F5** to "reset" the file to the last state.
* You can easily navigate with **TAB**
* In the password field, **ENTER** will toggle the de-/encryption depending on the current state
* Use 'f' to select filter, 'p' to select password field and '1' for the first input field to add a new entry (works only when you are not in an input field already)

# Danger
* You can save the file also unencrypted, but do it with care.
* Don't visit bad websites with sensitive information in your clipboard! (copied)
* Don't forget your master password! The file cannot be restored in any other way. (but brute-forcing of course)
* The danger here 

## ToDo, Bugs & Technical Stuff
* Everything works so far and it's stable. I use it.
* I did **NOT** look at the very deep cryptographic situation and considered salt, other chaining algorithms, better ways to get the right key length from the password and so on, but I will probably in the future. For now, this is just a better solution for your textfiles and messy sticky notes everywhere, with a good enough encryption for non-NSA people.
* There are some little features that may be helpfull here and there, and maybe some cleaing of the code, but there are no special plans right now, I will work on them at some point when I am in the mood.
* The code still contains some unnecessary code fragments I think that can be stripped
* I stuffed this together in one day, so sorry for the bad code layout and stuff, but I just wanted it to work properly first before it looks good
* ToDo: Adding textarea or something to easyily paste old encrypted data to new version of the file

## License

This Software (file) is published under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html)