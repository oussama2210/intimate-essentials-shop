import bcrypt from 'bcryptjs';

export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4 (weak to strong)
  feedback: string[];
}

export class PasswordUtils {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
      feedback.push('Password should contain at least one uppercase letter');
    } else {
      score += 1;
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
      feedback.push('Password should contain at least one lowercase letter');
    } else {
      score += 1;
    }

    // Check for numbers
    if (!/\d/.test(password)) {
      feedback.push('Password should contain at least one number');
    } else {
      score += 1;
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('Password should contain at least one special character');
    } else {
      score += 1;
    }

    // Check for common patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /admin/i,
      /qwerty/i,
      /abc123/i,
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        feedback.push('Password contains common patterns and is easily guessable');
        score = Math.max(0, score - 1);
        break;
      }
    }

    const isValid = score >= 3 && password.length >= 8;

    return {
      isValid,
      score: Math.min(4, score),
      feedback,
    };
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}