import crypto from 'crypto';
import env from '../config/environment';
import logger from './logger';

const ALGORITHM = 'aes-256-cbc';
// Ensure we have a 32-byte key by hashing the secret
const SECRET_KEY = crypto.createHash('sha256').update(env.JWT_SECRET || 'fallback_secret_for_cryptography_32_chars').digest();
const IV_LENGTH = 16;

/**
 * Encrypts a table token to make it unguessable and tamper-proof in URLs.
 */
export const encryptToken = (token: string): string => {
  if (!token) return '';
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}_${encrypted}`;
  } catch (err: any) {
    logger.error('Error encrypting token:', err);
    return token;
  }
};

/**
 * Decrypts an encrypted table token. Returns empty string if invalid/tampered.
 */
export const decryptToken = (encryptedToken: string): string => {
  if (!encryptedToken) return '';
  try {
    const parts = encryptedToken.split('_');
    if (parts.length !== 2) {
      // Not encrypted or invalid format
      return '';
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err: any) {
    logger.warn(`Failed to decrypt token: ${err.message}`);
    return '';
  }
};
