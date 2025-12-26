import { Router } from 'express';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getOrderByTracking,
} from '../controllers/orderController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/', createOrder);
router.get('/tracking/:trackingNumber', getOrderByTracking);

// Protected routes (admin only)
router.get('/', authenticateAdmin, getAllOrders);
router.get('/:id', authenticateAdmin, getOrderById);
router.put('/:id/status', authenticateAdmin, updateOrderStatus);

export default router;
