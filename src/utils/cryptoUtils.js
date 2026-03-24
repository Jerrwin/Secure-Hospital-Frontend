import CryptoJS from "crypto-js";

// IMPORTANT: In a production environment, this key should be managed via environment variables
// and potentially derived from a user-specific secret or a server-side provided key.
const ENCRYPTION_KEY = process.env.REACT_APP_OFFLINE_STORAGE_KEY || "secure-hospital-secret-key-2024";

/**
 * Encrypts data using AES encryption.
 * @param {any} data - The data to encrypt (will be stringified if it's an object).
 * @returns {string} - The base64 encoded encrypted string.
 */
export const encryptData = (data) => {
  try {
    const stringData = typeof data === "string" ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(stringData, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
};

/**
 * Decrypts data using AES encryption.
 * @param {string} encryptedData - The base64 encoded encrypted string.
 * @returns {any} - The decrypted data (parsed if it was an object).
 */
export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
