import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { StatusCode } from '../constants/statusCode.enum';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(StatusCode.BAD_REQUEST).json({
      message: errors.array()[0].msg,
    });
  }

  next();
};
