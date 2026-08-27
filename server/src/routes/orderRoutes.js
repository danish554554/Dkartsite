import express from 'express';
import {
  createOrder,
  getOrderById,
  trackOrder,
  getUserOrders
} from '../controllers/orderController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/orders', optionalAuth, createOrder);
router.get('/orders/track', trackOrder);
router.get('/orders/user', requireAuth, getUserOrders);
router.get('/orders/:id', getOrderById);

export default router;
