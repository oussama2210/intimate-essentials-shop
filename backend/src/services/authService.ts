import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { PasswordUtils } from '../utils/password';
import { AdminLoginInput } from '../utils/validation';

const prisma = new PrismaClient();

export interface AuthResponse {
  success: boolean;
  data?: {
    admin: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
    token: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export class AuthService {
  static async loginAdmin(credentials: AdminLoginInput): Promise<AuthResponse> {
    try {
      // Find admin by username
      const admin = await prisma.admin.findUnique({
        where: { username: credentials.username },
      });

      if (!admin) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password',
          },
        };
      }

      // Verify password
      const isPasswordValid = await PasswordUtils.comparePassword(
        credentials.password,
        admin.passwordHash
      );

      if (!isPasswordValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password',
          },
        };
      }

      // Generate JWT token
      const token = generateToken(admin);

      return {
        success: true,
        data: {
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
          },
          token,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during login',
        },
      };
    }
  }

  static async createAdmin(data: {
    username: string;
    email: string;
    password: string;
    role?: 'ADMIN' | 'SUPER_ADMIN';
  }): Promise<AuthResponse> {
    try {
      // Check if username already exists
      const existingAdmin = await prisma.admin.findUnique({
        where: { username: data.username },
      });

      if (existingAdmin) {
        return {
          success: false,
          error: {
            code: 'USERNAME_EXISTS',
            message: 'Username already exists',
          },
        };
      }

      // Check if email already exists
      const existingEmail = await prisma.admin.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        return {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already exists',
          },
        };
      }

      // Hash password
      const passwordHash = await PasswordUtils.hashPassword(data.password);

      // Create admin
      const admin = await prisma.admin.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash,
          role: data.role || 'ADMIN',
        },
      });

      // Generate token
      const token = generateToken(admin);

      return {
        success: true,
        data: {
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
          },
          token,
        },
      };
    } catch (error) {
      console.error('Create admin error:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating admin',
        },
      };
    }
  }

  static async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: { code: string; message: string } }> {
    try {
      // Validate new password strength
      const passwordStrength = PasswordUtils.validatePasswordStrength(newPassword);
      if (!passwordStrength.isValid) {
        return {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: `Password is too weak: ${passwordStrength.feedback.join(', ')}`,
          },
        };
      }

      // Find admin
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        return {
          success: false,
          error: {
            code: 'ADMIN_NOT_FOUND',
            message: 'Admin not found',
          },
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordUtils.comparePassword(
        currentPassword,
        admin.passwordHash
      );

      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Current password is incorrect',
          },
        };
      }

      // Hash new password
      const newPasswordHash = await PasswordUtils.hashPassword(newPassword);

      // Update password
      await prisma.admin.update({
        where: { id: adminId },
        data: { passwordHash: newPasswordHash },
      });

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while changing password',
        },
      };
    }
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string) {
    return PasswordUtils.validatePasswordStrength(password);
  }

  /**
   * Generate a secure password
   */
  static generateSecurePassword(length: number = 12): string {
    return PasswordUtils.generateSecurePassword(length);
  }
}