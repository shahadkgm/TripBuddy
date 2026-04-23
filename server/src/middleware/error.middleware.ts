import { Request, Response, NextFunction } from 'express'; // 1. Added NextFunction
import { AppError } from '../utils/AppError';
import { StatusCode } from '../constants/statusCode.enum';

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction // 2. MUST be here, even if unused
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle standard Error instances (like from Multer)
  if (err instanceof Error) {
    return res.status(StatusCode.BAD_REQUEST).json({
      success: false,
      message: err.message,
    });
  }

  // Log the actual error for debugging
  console.error('Error Caught in Middleware:', err);

  return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal Server Error',
  });
};
