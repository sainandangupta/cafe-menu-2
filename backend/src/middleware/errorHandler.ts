import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${err.message}`, err.stack);

  // Zod Validation Errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      code: 400,
      error: 'ValidationError',
      message: 'Input validation failed',
      details: err.errors || err.issues,
    });
  }

  // Custom Error Classes
  if (err instanceof CustomError) {
    return res.status(err.code).json({
      status: err.status,
      code: err.code,
      error: err.name,
      message: err.message,
    });
  }

  // Prisma Client Errors (e.g. unique constraint, foreign key violation)
  if (err.code && err.code.startsWith('P')) {
    let statusCode = 500;
    let message = 'Database constraint error';
    let errorName = 'DatabaseError';

    if (err.code === 'P2002') {
      statusCode = 409;
      message = `Duplicate field value: ${err.meta?.target || 'unique key constraint'}`;
      errorName = 'ConflictError';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = err.meta?.cause || 'Record not found';
      errorName = 'NotFoundError';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Foreign key constraint failed';
      errorName = 'ValidationError';
    }

    return res.status(statusCode).json({
      status: 'error',
      code: statusCode,
      error: errorName,
      message,
    });
  }

  // Standard/Unknown Server Errors
  const statusCode = typeof err.code === 'number' && err.code >= 400 && err.code < 600 ? err.code : 500;
  const isGenericError = statusCode === 500;
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    error: isGenericError ? 'InternalServerError' : (err.name || 'Error'),
    message: isGenericError ? 'Internal server error' : (err.message || 'An unexpected error occurred'),
  });
};

export default errorHandler;
