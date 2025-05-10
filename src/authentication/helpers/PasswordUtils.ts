import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { EncodePasswordOptions } from './RetrieveUserBuilder';

/**
 * Generates a password hash based on the specified algorithm
 * @param password The plain text password to hash
 * @param options Encoding options including algorithm and settings
 * @returns A promise that resolves to the hashed password
 */
export async function generatePasswordHash(password: string, options: EncodePasswordOptions): Promise<string> {
  switch (options.algorithm) {
    case 'bcrypt': {
      const saltRounds = options.bcryptSaltRounds || 10;
      return await bcrypt.hash(password, saltRounds);
    }
    case 'sha256':
      return crypto.createHash('sha256').update(password).digest('hex');
    case 'sha512':
      return crypto.createHash('sha512').update(password).digest('hex');
    case 'md5':
      return crypto.createHash('md5').update(password).digest('hex');
    default:
      return password;
  }
}

/**
 * Verifies a password against a stored hash
 * @param plainPassword The plain text password to verify
 * @param hashedPassword The stored password hash
 * @param options Encoding options including algorithm
 * @returns A promise that resolves to a boolean indicating if the password is valid
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string, options: EncodePasswordOptions): Promise<boolean> {
  if (options.algorithm === 'bcrypt') {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } else {
    // For other algorithms, we generate a hash and compare
    const generatedHash = await generatePasswordHash(plainPassword, options);
    return generatedHash === hashedPassword;
  }
}

/**
 * Generates a secure random password of specified length
 * @param length The length of the password to generate
 * @returns A secure random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
  let password = '';
  
  // Generate cryptographically secure random bytes
  const randomBytes = crypto.randomBytes(length);
  
  // Convert bytes to password characters
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charset.length;
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Validates password strength
 * @param password The password to validate
 * @param options Options for password validation
 * @returns An object indicating if the password is valid and any validation messages
 */
export function validatePasswordStrength(
  password: string, 
  options: {
    minLength?: number,
    requireUppercase?: boolean,
    requireLowercase?: boolean,
    requireNumbers?: boolean, 
    requireSpecialChars?: boolean
  } = {}
): { valid: boolean, message: string } {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options;
  
  const messages = [];
  
  if (password.length < minLength) {
    messages.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    messages.push('Password must contain at least one uppercase letter');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    messages.push('Password must contain at least one lowercase letter');
  }
  
  if (requireNumbers && !/[0-9]/.test(password)) {
    messages.push('Password must contain at least one number');
  }
  
  if (requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    messages.push('Password must contain at least one special character');
  }
  
  return {
    valid: messages.length === 0,
    message: messages.join('. ')
  };
} 