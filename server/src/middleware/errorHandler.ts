import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  const mongooseDuplicateKey = (err as any)?.code === 11000;
  if (mongooseDuplicateKey) {
    res.status(409).json({
      success: false,
      message: 'A record with these details already exists',
      code: 'DUPLICATE_RECORD',
    });
    return;
  }

  if (!env.isProduction) {
    console.error(err);
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again.',
    code: 'INTERNAL_ERROR',
  });
}
