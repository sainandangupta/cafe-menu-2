import { Router } from 'express';
import adminController from '../controllers/adminController';
import authMiddleware from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();

// Apply admin guard globally to all admin routes
router.use(authMiddleware);
router.use(requireAdmin);

router.get('/reports', adminController.getReports);
router.get('/dish-ratings', adminController.getDishRatingsReport);
router.get('/export-orders', adminController.exportOrdersCsv);

export default router;
