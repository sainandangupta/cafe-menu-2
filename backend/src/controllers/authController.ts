import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { sendResponse } from '../utils/formatters';

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      return sendResponse(res, 200, result, 'Logged in successfully');
    } catch (err) {
      next(err);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In stateless JWT, client deletes the token.
      // Optionally we could blacklist on Redis if needed.
      return sendResponse(res, 200, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  },
};

export default authController;
