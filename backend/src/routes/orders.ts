import { Router } from 'express';
import orderController from '../controllers/orderController';
import authMiddleware from '../middleware/auth';
import { requireOwner, requireAdmin } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/orders';

const router = Router();

// Public order placement
router.post('/', validateRequest(createOrderSchema), orderController.createOrder);

// Protected order history
router.get('/history', authMiddleware, requireOwner, orderController.getOrderHistory);

// Order lookup (handles optional auth or tableToken query parameter validation in controller)
router.get('/:id', orderController.getOrderById);
router.get('/:id/items', orderController.getOrderItems);

// Protected order listing and management
router.get('/', authMiddleware, requireOwner, orderController.getOrders);

router.patch(
  '/:id',
  authMiddleware,
  requireOwner,
  validateRequest(updateOrderStatusSchema),
  orderController.updateStatus
);

// Admin-only order removal
router.delete('/:id', authMiddleware, requireAdmin, orderController.deleteOrder);

export default router;
