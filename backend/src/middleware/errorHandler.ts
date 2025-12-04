import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';

// Centralized error-handling middleware
// Make sure this is registered AFTER all routes.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);

  // Multer (file upload) errors
  if (err instanceof MulterError) {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Maximum size is 5MB.';
    }
    return res.status(400).json({ message });
  }

  // Multer fileFilter custom error
  if (err instanceof Error && err.message === 'Unsupported file type') {
    return res.status(400).json({
      message: 'Unsupported file type. Only images and PDF files are allowed.',
    });
  }

  if (err instanceof Error) {
    // If an error already has a known status/message shape, surface it
    // @ts-expect-error custom status property sometimes attached in controllers
    const status = typeof err.status === 'number' ? err.status : 500;
    const safeMessage = status >= 500 ? 'Internal server error' : err.message;
    return res.status(status).json({ message: safeMessage });
  }

  return res.status(500).json({ message: 'Internal server error' });
};


