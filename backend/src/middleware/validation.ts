import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validateRequest = (
  schema: ZodTypeAny,
  target: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      // Re-assign validated properties to the request object
      req[target] = parsed;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default validateRequest;
