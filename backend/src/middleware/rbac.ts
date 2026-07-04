import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Admin permission required');
  }

  next();
};

export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== 'owner' && req.user.role !== 'admin') {
    throw new ForbiddenError('Owner or Admin permission required');
  }

  next();
};

// Check if owner/admin is authorized to read/modify cafe-specific items
export const checkCafeAccess = (paramName: string = 'cafeId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Admins can bypass cafe isolation check
    if (req.user.role === 'admin') {
      return next();
    }

    const targetCafeId = req.params[paramName] || req.query[paramName] || req.body[paramName];

    if (!targetCafeId) {
      return next();
    }

    if (req.user.cafeId !== targetCafeId) {
      throw new ForbiddenError('Access denied: Cafe ID mismatch');
    }

    next();
  };
};
