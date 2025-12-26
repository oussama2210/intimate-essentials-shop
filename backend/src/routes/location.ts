import { Router } from 'express';
import { LocationController } from '../controllers/locationController';
import { generalRateLimit } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   GET /api/locations/wilayas
 * @desc    Get all Algeria wilayas
 * @access  Public
 */
router.get('/wilayas', generalRateLimit, LocationController.getWilayas);

/**
 * @route   GET /api/locations/wilayas/:id
 * @desc    Get wilaya by ID with baladiya
 * @access  Public
 */
router.get('/wilayas/:id', generalRateLimit, LocationController.getWilayaById);

/**
 * @route   GET /api/locations/wilayas/:wilayaId/baladiya
 * @desc    Get baladiya for a specific wilaya
 * @access  Public
 */
router.get('/wilayas/:wilayaId/baladiya', generalRateLimit, LocationController.getBaladiyaByWilaya);

/**
 * @route   POST /api/locations/delivery-cost
 * @desc    Calculate delivery cost for a wilaya
 * @access  Public
 */
router.post('/delivery-cost', generalRateLimit, LocationController.calculateDeliveryCost);

/**
 * @route   GET /api/locations/search
 * @desc    Search wilayas and baladiya
 * @access  Public
 */
router.get('/search', generalRateLimit, LocationController.searchLocations);

export default router;