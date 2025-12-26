import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { adminLoginSchema } from '../utils/validation';
import { z } from 'zod';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = adminLoginSchema.parse(req.body);
      
      // Attempt login
      const result = await AuthService.loginAdmin(validatedData);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          message: 'Login successful',
        });
      } else {
        res.status(401).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
        });
      } else {
        console.error('Login controller error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An error occurred during login',
          },
        });
      }
    }
  }

  static async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const createAdminSchema = z.object({
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        role: z.enum(['ADMIN', 'SUPER_ADMIN']).optional(),
      });

      const validatedData = createAdminSchema.parse(req.body);
      
      const result = await AuthService.createAdmin(validatedData);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Admin created successfully',
        });
      } else {
        const statusCode = result.error?.code === 'USERNAME_EXISTS' || 
                          result.error?.code === 'EMAIL_EXISTS' ? 409 : 400;
        res.status(statusCode).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
        });
      } else {
        console.error('Create admin controller error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An error occurred while creating admin',
          },
        });
      }
    }
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const changePasswordSchema = z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters'),
      });

      const validatedData = changePasswordSchema.parse(req.body);
      
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const result = await AuthService.changePassword(
        req.admin.id,
        validatedData.currentPassword,
        validatedData.newPassword
      );
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Password changed successfully',
        });
      } else {
        const statusCode = result.error?.code === 'INVALID_PASSWORD' ? 400 : 500;
        res.status(statusCode).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
        });
      } else {
        console.error('Change password controller error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An error occurred while changing password',
          },
        });
      }
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          admin: req.admin,
        },
      });
    } catch (error) {
      console.error('Get profile controller error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching profile',
        },
      });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Since we're using stateless JWT tokens, logout is handled client-side
      // by removing the token from storage. We just return a success response.
      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during logout',
        },
      });
    }
  }
}