// ============================================
// HTMLVault - Encryption Module (Web Crypto API)
// ============================================

/**
 * Encrypts plaintext using AES-GCM with a password
 * @param {string} password - User's master password
 * @param {string} plaintext - Content to encrypt
 * @returns {Promise<string>} Hex string containing salt+iv+ciphertext+tag
 */
async function encrypt(password, plaintext) {
  try {
    // Generate random salt (16 bytes) and IV (12 bytes for GCM)
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive encryption key from password using PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // Configurable - higher is more secure but slower
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // Encrypt the plaintext
    const encodedPlaintext = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encodedPlaintext
    );
    
    // Combine salt + iv + ciphertext into single array
    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
    
    // Convert to hex string for storage
    return bytesToHex(combined);
    
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypts ciphertext using AES-GCM with a password
 * @param {string} password - User's master password
 * @param {string} encryptedHex - Hex string containing salt+iv+ciphertext+tag
 * @returns {Promise<string>} Decrypted plaintext
 */
async function decrypt(password, encryptedHex) {
  try {
    // Convert hex string back to bytes
    const combined = hexToBytes(encryptedHex);
    
    // Extract salt (first 16 bytes), IV (next 12 bytes), and ciphertext (rest)
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);
    
    // Derive the same encryption key from password using the stored salt
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // Must match encryption iterations
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt the ciphertext
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );
    
    // Convert decrypted bytes back to string
    return new TextDecoder().decode(decrypted);
    
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed - wrong password or corrupted data');
  }
}

/**
 * Convert byte array to hex string
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to byte array
 * @param {string} hex
 * @returns {Uint8Array}
 */
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// ============================================
// Example Usage (for testing)
// ============================================

/*
// Encrypt example:
const password = "mySecurePassword123";
const content = "This is my secret data!";
const encrypted = await encrypt(password, content);
console.log("Encrypted:", encrypted);
// Output: long hex string like "a3f2c1b4e5d6..."

// Decrypt example:
const decrypted = await decrypt(password, encrypted);
console.log("Decrypted:", decrypted);
// Output: "This is my secret data!"

// Wrong password:
try {
  await decrypt("wrongPassword", encrypted);
} catch (error) {
  console.log(error.message); // "Decryption failed - wrong password or corrupted data"
}
*/
