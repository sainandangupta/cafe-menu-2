import { Router } from 'express';
import authController from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import { loginSchema } from '../validators/auth';
import authMiddleware from '../middleware/auth';
import loginRateLimiter from '../middleware/rateLimiter';

const router = Router();

router.post('/login', loginRateLimiter, validateRequest(loginSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);

export default router;
