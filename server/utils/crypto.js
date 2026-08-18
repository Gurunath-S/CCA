const crypto = require('crypto');

// Standard AES-256-GCM settings
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

// Load the key. In production, this must be a 32-byte hex key or generated securely.
// We'll fallback to a hardcoded key in development to avoid crashes.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') 
  : Buffer.from('62e3d8f36c5b4e9fb5a4b7f08c3e64f162e3d8f36c5b4e9fb5a4b7f08c3e64f1', 'hex'); // fallback 32-byte key

const HMAC_SECRET = process.env.HMAC_SECRET || 'cca-email-hash-secret-salt-2026';

/**
 * Encrypts cleartext using AES-256-GCM.
 * @param {string} text - The plaintext to encrypt.
 * @returns {string} - The format ivHex:ciphertextHex:authTagHex.
 */
function encrypt(text) {
  if (!text) return text;
  
  // If text is already encrypted, do not re-encrypt (prevents double encryption)
  if (typeof text === 'string' && text.split(':').length === 3) {
    return text;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

/**
 * Decrypts AES-256-GCM encrypted text. Falls back to original text if not encrypted or parsing fails.
 * @param {string} ciphertext - The ivHex:ciphertextHex:authTagHex formatted string.
 * @returns {string} - Decrypted plaintext.
 */
function decrypt(ciphertext) {
  if (!ciphertext) return ciphertext;
  
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    // If it doesn't have 3 parts separated by colons, it is likely legacy plain text.
    return ciphertext;
  }
  
  try {
    const [ivHex, encryptedHex, authTagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption failed, returning original ciphertext:', err.message);
    return ciphertext;
  }
}

/**
 * Generates a SHA-256 HMAC hash of the email address for lookups and uniqueness.
 * @param {string} email - The email to hash.
 * @returns {string} - The hexadecimal hash.
 */
function hashEmail(email) {
  if (!email) return email;
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(email.toLowerCase().trim())
    .digest('hex');
}

module.exports = {
  encrypt,
  decrypt,
  hashEmail
};
