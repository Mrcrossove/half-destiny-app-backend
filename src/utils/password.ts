import crypto from 'crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, original] = String(storedHash || '').split(':');
  if (!salt || !original) return false;

  const derived = crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex');
  const originalBuffer = Buffer.from(original, 'hex');
  const derivedBuffer = Buffer.from(derived, 'hex');

  if (originalBuffer.length !== derivedBuffer.length) return false;
  return crypto.timingSafeEqual(originalBuffer, derivedBuffer);
}
