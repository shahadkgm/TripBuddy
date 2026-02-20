export interface IApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown;
}

export class ApiResponse<T> implements IApiResponse<T> {
    constructor(
        public success: boolean,
        public message: string,
        public data?: T,
        public errors?: unknown
    ) { }

    /**
     * Static helper for success responses
     */
    static success<T>(data: T, message = 'Success'): ApiResponse<T> {
        return new ApiResponse<T>(true, message, data);
    }

    /**
     * Static helper for error responses
     */
    static error(message = 'Error', errors?: unknown): ApiResponse<null> {
        return new ApiResponse<null>(false, message, undefined, errors);
    }
}
