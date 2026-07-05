import { Request, Response, NextFunction } from 'express';

// Simple in-memory ip store for tracking login rate limits
const ipStore = new Map<string, { count: number; resetTime: number }>();

export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const timeframe = 15 * 60 * 1000; // 15 minutes
  const limit = 100;

  const record = ipStore.get(ip);

  // If no record exists or current time is past reset time, reset/create record
  if (!record || now > record.resetTime) {
    ipStore.set(ip, { count: 1, resetTime: now + timeframe });
    return next();
  }

  // If limit is exceeded, return 429 Error
  if (record.count >= limit) {
    const timeRemaining = Math.ceil((record.resetTime - now) / 1000 / 60);
    return res.status(429).json({
      status: 'error',
      code: 429,
      error: 'TooManyRequests',
      message: `Too many login attempts. Please try again after ${timeRemaining} minutes.`,
    });
  }

  record.count += 1;
  next();
};

export default loginRateLimiter;
