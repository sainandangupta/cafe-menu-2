import { Router } from 'express';
import ratingController from '../controllers/ratingController';
import { validateRequest } from '../middleware/validation';
import ratingSchema from '../validators/ratings';

const router = Router();

// Public endpoints
router.get('/', ratingController.getRatings);
router.post('/', validateRequest(ratingSchema), ratingController.createRating);

export default router;
