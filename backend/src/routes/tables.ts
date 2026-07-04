import { Router } from 'express';
import tableController from '../controllers/tableController';
import authMiddleware from '../middleware/auth';
import { requireOwner } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import { createTableSchema, updateTableSchema } from '../validators/tables';

const router = Router();

// Public table QR token validation (customers scans)
router.get('/validate', tableController.validateToken);

// Protected table management endpoints
router.get('/', authMiddleware, requireOwner, tableController.getTables);

router.post(
  '/',
  authMiddleware,
  requireOwner,
  validateRequest(createTableSchema),
  tableController.createTable
);

router.patch(
  '/:id',
  authMiddleware,
  requireOwner,
  validateRequest(updateTableSchema),
  tableController.updateTable
);

router.delete(
  '/:id',
  authMiddleware,
  requireOwner,
  tableController.deleteTable
);

router.post(
  '/generate-qrs',
  authMiddleware,
  requireOwner,
  tableController.generateQrs
);

export default router;
