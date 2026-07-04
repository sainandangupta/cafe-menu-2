import { Router } from 'express';
import settingsController from '../controllers/settingsController';
import authMiddleware from '../middleware/auth';
import { requireOwner } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import updateSettingsSchema from '../validators/settings';

const router = Router();

// Protected settings management (Owner/Admin)
router.get('/', authMiddleware, requireOwner, settingsController.getSettings);
router.patch(
  '/',
  authMiddleware,
  requireOwner,
  validateRequest(updateSettingsSchema),
  settingsController.updateSettings
);

export default router;
