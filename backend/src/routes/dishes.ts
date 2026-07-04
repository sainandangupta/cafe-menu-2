import { Router } from 'express';
import multer from 'multer';
import dishController from '../controllers/dishController';
import authMiddleware, { optionalAuthMiddleware } from '../middleware/auth';
import { requireOwner } from '../middleware/rbac';
import { validateRequest } from '../middleware/validation';
import { createDishSchema, updateDishSchema } from '../validators/dishes';
import { ValidationError } from '../utils/errors';

const router = Router();

// Multer Memory Storage Configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ValidationError('Only image files are allowed (png, jpg, jpeg, webp)'));
    }
  },
});

// Public endpoints (optional auth to distinguish owner vs customer)
router.get('/', optionalAuthMiddleware, dishController.getDishes);
router.get('/:id', dishController.getDishById);

// Owner/Admin protected endpoints
router.post(
  '/',
  authMiddleware,
  requireOwner,
  validateRequest(createDishSchema),
  dishController.createDish
);

router.patch(
  '/:id',
  authMiddleware,
  requireOwner,
  validateRequest(updateDishSchema),
  dishController.updateDish
);

router.delete(
  '/:id',
  authMiddleware,
  requireOwner,
  dishController.deleteDish
);

// File upload endpoint (Content-Type: multipart/form-data)
router.post(
  '/upload-image',
  authMiddleware,
  requireOwner,
  upload.single('file'),
  dishController.uploadImage
);

export default router;
