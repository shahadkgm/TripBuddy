import { StatusCode } from '../constants/statusCode.enum';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;

  constructor(message: string, statusCode = StatusCode.INTERNAL_SERVER_ERROR) {
    super(message);

    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}
