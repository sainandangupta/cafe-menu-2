import { Router } from 'express';
import categoryController from '../controllers/categoryController';
import authMiddleware from '../middleware/auth';
import { requireOwner } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import { createCategorySchema, updateCategorySchema } from '../validators/categories';

const router = Router();

// Public listing
router.get('/', categoryController.getCategories);

// Protected CRUD
router.post(
  '/',
  authMiddleware,
  requireOwner,
  validateRequest(createCategorySchema),
  categoryController.createCategory
);

router.patch(
  '/:id',
  authMiddleware,
  requireOwner,
  validateRequest(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  requireOwner,
  categoryController.deleteCategory
);

export default router;
