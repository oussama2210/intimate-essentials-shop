import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/auth';
import { authRateLimit, strictRateLimit } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', authRateLimit, AuthController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Admin logout (client-side token removal)
 * @access  Private (Admin)
 */
router.post('/logout', authenticateAdmin, AuthController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current admin profile
 * @access  Private (Admin)
 */
router.get('/profile', authenticateAdmin, AuthController.getProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change admin password
 * @access  Private (Admin)
 */
router.put('/change-password', authenticateAdmin, AuthController.changePassword);

/**
 * @route   POST /api/auth/create-admin
 * @desc    Create new admin user
 * @access  Private (Super Admin only)
 */
router.post('/create-admin', strictRateLimit, authenticateAdmin, requireSuperAdmin, AuthController.createAdmin);

export default router;