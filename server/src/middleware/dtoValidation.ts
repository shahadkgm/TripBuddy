import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { StatusCode } from '../constants/statusCode.enum';

export function dtoValidationMiddleware<T extends object>(
  type: new (...args: unknown[]) => T,
  skipMissingProperties = false
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const dtoObj = plainToInstance(type, req.body);
    validate(dtoObj, { skipMissingProperties }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) => Object.values(error.constraints || {}))
          .flat()
          .join(', ');
        return res.status(StatusCode.BAD_REQUEST).json({ message });
      } else {
        req.body = dtoObj;
        next();
      }
    });
  };
}
