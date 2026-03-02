import { Response } from 'express';
import { StatusCode } from '../../constants/statusCode.enum';

export abstract class BaseController {

    protected sendSuccess<T>(res: Response, data: T, message: string = 'Success', statusCode: StatusCode = StatusCode.OK) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    protected sendCreated<T>(res: Response, data: T, message: string = 'Created') {
        return this.sendSuccess(res, data, message, StatusCode.CREATED);
    }

    protected sendError(res: Response, message: string = 'Internal Server Error', statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR, errors: unknown = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors
        });
    }

    protected sendBadRequest(res: Response, message: string = 'Bad Request') {
        return this.sendError(res, message, StatusCode.BAD_REQUEST);
    }

    protected sendNotFound(res: Response, message: string = 'Resource Not Found') {
        return this.sendError(res, message, StatusCode.NOT_FOUND);
    }

    protected sendUnauthorized(res: Response, message: string = 'Unauthorized') {
        return this.sendError(res, message, StatusCode.UNAUTHORIZED);
    }

    protected sendForbidden(res: Response, message: string = 'Forbidden') {
        return this.sendError(res, message, StatusCode.FORBIDDEN);
    }
}
