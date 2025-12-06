// ============================================
// HTMLVault - Main Application Logic
// ============================================

// Get DOM elements
const passwordInput = document.getElementById('password');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const encryptedContentDiv = document.getElementById('encryptedContent');

// Track current state
let isEncrypted = false;

// Detect if content is encrypted (hex string pattern)
function detectEncrypted() {
  const content = encryptedContentDiv.innerHTML.trim();
  // Check if content looks like hex (only contains 0-9, a-f, A-F)
  return /^[0-9a-fA-F]+$/.test(content) && content.length > 64;
}

// Auto-detect and encrypt/decrypt on Enter key
passwordInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const encrypted = detectEncrypted();
    if (encrypted) {
      await decryptContent();
    } else {
      await encryptContent();
    }
  }
});

/**
 * Encrypt the current content
 */
async function encryptContent() {
  const password = passwordInput.value;
  
  try {
    // Get current content from the div
    const plaintext = encryptedContentDiv.innerHTML;
    
    if (!plaintext || plaintext.trim() === '') {
      showToast('No content to encrypt', 'error');
      return;
    }
    
    // Show loading state
    encryptBtn.disabled = true;
    
    // Encrypt the content
    const encryptedHex = await encrypt(password, plaintext);
    
    // Replace content with encrypted hex
    encryptedContentDiv.innerHTML = encryptedHex;
    encryptedContentDiv.style.fontFamily = 'monospace';
    encryptedContentDiv.style.fontSize = '0.8em';
    encryptedContentDiv.style.color = 'var(--color-text-muted)';
    encryptedContentDiv.style.wordBreak = 'break-all';
    
    isEncrypted = true;
    
    // Keep password and focus on password field
    passwordInput.focus();
    
    // Show success message
    showToast('✓ Content encrypted successfully', 'success');
    
  } catch (error) {
    console.error('Encryption failed:', error);
    showToast('Encryption failed: ' + error.message, 'error');
  } finally {
    encryptBtn.disabled = false;
  }
}

/**
 * Decrypt the current content
 */
async function decryptContent() {
  const password = passwordInput.value;
  
  try {
    // Get encrypted hex from the div
    const encryptedHex = encryptedContentDiv.innerHTML.trim();
    
    if (!encryptedHex) {
      showToast('No encrypted content to decrypt', 'error');
      return;
    }
    
    // Show loading state
    decryptBtn.disabled = true;
    
    // Decrypt the content
    const plaintext = await decrypt(password, encryptedHex);
    
    // Replace content with decrypted plaintext
    encryptedContentDiv.innerHTML = plaintext;
    encryptedContentDiv.style.fontFamily = '';
    encryptedContentDiv.style.fontSize = '';
    encryptedContentDiv.style.color = '';
    encryptedContentDiv.style.wordBreak = '';
    
    // Execute any scripts in the decrypted content
    executeScriptsInContent(encryptedContentDiv);
    
    isEncrypted = false;
    
    // Keep password and focus on password field
    passwordInput.focus();
    
    // Show success message
    showToast('✓ Content decrypted successfully', 'success');
    
  } catch (error) {
    console.error('Decryption failed:', error);
    showToast('Decryption failed - wrong password or corrupted data', 'error');
    passwordInput.select();
  } finally {
    decryptBtn.disabled = false;
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showToast(message, type = 'success') {
  // Dismiss any existing toasts immediately
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(t => removeToast(t));
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Add to body
  document.body.appendChild(toast);
  
  // Trigger animation after a small delay (for CSS transition)
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Remove toast on click
  toast.addEventListener('click', () => {
    removeToast(toast);
  });
  
  // Auto-remove after 2 seconds
  setTimeout(() => {
    removeToast(toast);
  }, 2000);
}

function removeToast(toast) {
  if (!toast || !toast.parentElement) return;
  
  toast.classList.add('hide');
  
  // Remove from DOM after animation completes
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 500);
}

/**
 * Handle Enter key in password field
 */
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (isEncrypted) {
      decryptContent();
    } else {
      encryptContent();
    }
  }
});

// Attach event listeners
encryptBtn.addEventListener('click', encryptContent);
decryptBtn.addEventListener('click', decryptContent);

// ============================================
// Password Visibility Toggle (Eye Icon)
// ============================================

const togglePasswordBtn = document.getElementById('togglePassword');

// Show password while button is held down
togglePasswordBtn.addEventListener('mousedown', (e) => {
  e.preventDefault();
  passwordInput.classList.remove('password-masked');
});

togglePasswordBtn.addEventListener('mouseup', () => {
  passwordInput.classList.add('password-masked');
});

togglePasswordBtn.addEventListener('mouseleave', () => {
  passwordInput.classList.add('password-masked');
});

// Touch support for mobile
togglePasswordBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  passwordInput.classList.remove('password-masked');
});

togglePasswordBtn.addEventListener('touchend', () => {
  passwordInput.classList.add('password-masked');
});

// ============================================
// Password Strength Indicator
// ============================================

const strengthBars = document.querySelectorAll('.strength-bar');

function updatePasswordStrength() {
  const password = passwordInput.value;
  let strength = 0;
  
  // Clear all bars
  strengthBars.forEach(bar => bar.classList.remove('active'));
  
  if (password.length === 0) {
    return;
  }
  
  // Level 1: Has any characters
  if (password.length > 0) {
    strength = 1;
  }
  
  // Level 2: Has numbers
  if (/\d/.test(password)) {
    strength = 2;
  }
  
  // Level 3: Has special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength = 3;
  }
  
  // Level 4: Long and has all criteria (15+ chars)
  if (password.length >= 15 && /\d/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength = 4;
  }
  
  // Activate bars up to current strength level
  for (let i = 0; i < strength; i++) {
    strengthBars[i].classList.add('active');
  }
  
  // If max strength (4), make all bars gold
  if (strength === 4) {
    strengthBars.forEach(bar => bar.classList.add('gold'));
  } else {
    strengthBars.forEach(bar => bar.classList.remove('gold'));
  }
}

passwordInput.addEventListener('input', updatePasswordStrength);
passwordInput.addEventListener('keyup', updatePasswordStrength);
passwordInput.addEventListener('change', updatePasswordStrength);

// ============================================
// Editable Vault Title
// ============================================

const vaultTitle = document.getElementById('vaultTitle');
const editTitleBtn = document.getElementById('editTitleBtn');

// Enable editing on pen icon click
editTitleBtn.addEventListener('click', () => {
  vaultTitle.contentEditable = 'true';
  vaultTitle.focus();
  // Select all text
  const range = document.createRange();
  range.selectNodeContents(vaultTitle);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
});

// Enable editing on double-click
vaultTitle.addEventListener('dblclick', () => {
  vaultTitle.contentEditable = 'true';
  vaultTitle.focus();
  // Select all text
  const range = document.createRange();
  range.selectNodeContents(vaultTitle);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
});

// Save on Enter key
vaultTitle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveTitle();
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    vaultTitle.blur();
  }
});

// Save on blur (clicking out)
vaultTitle.addEventListener('blur', () => {
  saveTitle();
});

function saveTitle() {
  vaultTitle.contentEditable = 'false';
  const newTitle = vaultTitle.textContent.trim();
  
  // Update page title
  if (newTitle) {
    document.title = newTitle;
  } else {
    // Restore default if empty
    vaultTitle.textContent = 'HTMLVault';
    document.title = 'HTMLVault';
  }
  
  // Clear selection
  window.getSelection().removeAllRanges();
}

// ============================================
// Module/Template System
// ============================================

// Module templates (embedded)
const modules = {
  credentials: `HTML_TEMPLATE_CREDENTIALS`,
  textarea: `HTML_TEMPLATE_TEXTAREA`,
  image: `HTML_TEMPLATE_IMAGE`
};

const moduleBtn = document.getElementById('moduleBtn');
const moduleDropdown = document.getElementById('moduleDropdown');
const moduleItems = document.querySelectorAll('.dropdown-item');

// Toggle dropdown
moduleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  moduleDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!moduleBtn.contains(e.target) && !moduleDropdown.contains(e.target)) {
    moduleDropdown.classList.add('hidden');
  }
});

// Load module template
moduleItems.forEach(item => {
  item.addEventListener('click', () => {
    const moduleName = item.getAttribute('data-module');
    loadModule(moduleName);
    moduleDropdown.classList.add('hidden');
  });
});

/**
 * Execute scripts in a container element
 * Used after loading modules or decrypting content
 */
function executeScriptsInContent(container) {
  const scripts = container.querySelectorAll('script');
  scripts.forEach(script => {
    const newScript = document.createElement('script');
    if (script.src) {
      newScript.src = script.src;
    } else {
      newScript.textContent = script.textContent;
    }
    document.body.appendChild(newScript);
    document.body.removeChild(newScript);
  });
}

async function loadModule(moduleName) {
  if (!modules[moduleName]) {
    showToast('Module not found: ' + moduleName, 'error');
    return;
  }
  
  // Confirm if there's existing content
  /*
  if (encryptedContentDiv.innerHTML.trim() && !isEncrypted) {
    if (!confirm('This will replace your current content. Continue?')) {
      return;
    }
  }
  */
  
  try {
    // For build script: these placeholders will be replaced with actual HTML content
    let template = modules[moduleName];
    
    // Load the template content
    encryptedContentDiv.innerHTML = template;
    
    // Execute any scripts in the template
    executeScriptsInContent(encryptedContentDiv);
    
    encryptedContentDiv.style.fontFamily = '';
    encryptedContentDiv.style.fontSize = '';
    encryptedContentDiv.style.color = '';
    encryptedContentDiv.style.wordBreak = '';
    isEncrypted = false;
    
    console.log('Loaded module:', moduleName);
  } catch (error) {
    console.error('Failed to load module:', error);
    showToast('Failed to load module: ' + error.message, 'error');
  }
}

// ============================================
// Save/Download File Function
// ============================================

const downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', () => {
  saveHTMLFile();
});

function saveHTMLFile() {
  try {
    // Remove all toasts before saving
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => toast.remove());
    
    // Reset password strength bars before saving
    const strengthBars = document.querySelectorAll('.strength-bar');
    strengthBars.forEach(bar => {
      bar.classList.remove('active', 'gold');
    });
    
    // Get the current complete HTML document
    const htmlDoc = document.documentElement.outerHTML;
    
    // Restore password strength bars after capturing HTML
    updatePasswordStrength();
    
    // Create a blob with the HTML content
    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Use vault title as filename, or default to HTMLVault
    const vaultTitle = document.getElementById('vaultTitle').textContent.trim() || 'HTMLVault';
    const filename = vaultTitle.replace(/[^a-z0-9]/gi, '_') + '.html';
    a.download = filename;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('File saved:', filename);
    showToast('✓ File downloaded: ' + filename, 'success');
    
  } catch (error) {
    console.error('Save failed:', error);
    showToast('Failed to save file: ' + error.message, 'error');
  }
}

// Keyboard shortcut: Ctrl+S to save
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault(); // Prevent browser's default save dialog
    saveHTMLFile();
  }
  // Close help modal with Escape
  if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) {
    helpModal.classList.add('hidden');
  }
});

// ============================================
// Help Modal
// ============================================

const helpModal = document.getElementById('helpModal');
const helpBtn = document.getElementById('helpBtn');
const closeHelpBtn = document.getElementById('closeHelpBtn');

// Open help modal
helpBtn.addEventListener('click', () => {
  helpModal.classList.remove('hidden');
});

// Close help modal
closeHelpBtn.addEventListener('click', () => {
  helpModal.classList.add('hidden');
});

// Close modal when clicking outside
helpModal.addEventListener('click', (e) => {
  if (e.target === helpModal) {
    helpModal.classList.add('hidden');
  }
});

// ============================================
// Initialization
// ============================================

// Initialize
console.log('HTMLVault initialized');
console.log('Web Crypto API available:', !!window.crypto?.subtle);

// Detect initial state on page load
if (detectEncrypted()) {
  isEncrypted = true;
  console.log('Detected encrypted content on load');
} else {
  isEncrypted = false;
}

// Add some sample content for testing (remove this in production)
if (!encryptedContentDiv.innerHTML || encryptedContentDiv.innerHTML.trim() === '') {
  encryptedContentDiv.innerHTML = `
    <h2>Welcome to HTMLVault</h2>
    <p>This is sample content to test encryption.</p>
    <ul>
      <li>Enter a password above</li>
      <li>Click "Encrypt" to encrypt this content</li>
      <li>Save the HTML file (Ctrl+S)</li>
      <li>Reload the page</li>
      <li>Enter the same password and click "Decrypt"</li>
    </ul>
    <p><strong>Your data will be securely encrypted using AES-256-GCM!</strong></p>
  `;
}
