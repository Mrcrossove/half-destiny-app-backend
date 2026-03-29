import { NextFunction, Request, Response } from 'express';

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[backend] unhandled error', error);
  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: error.message || 'Internal server error'
  });
}
