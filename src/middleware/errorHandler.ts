import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[backend] unhandled error', error);

  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Image file exceeds maximum size of 10 MB' : error.message;
    return res.status(400).json({
      success: false,
      code: 'UPLOAD_INVALID_FILE',
      message
    });
  }

  if (error.message.includes('Only jpeg, png, webp, heic, and heif images are allowed')) {
    return res.status(400).json({
      success: false,
      code: 'UPLOAD_INVALID_FILE',
      message: error.message
    });
  }

  res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: error.message || 'Internal server error'
  });
}
