import { Request, Response, RequestHandler } from 'express';

/**
 * asyncHandler wraps an express middleware or controller function to handle
 * asynchronous errors by passing them to the next() function.
 */
export const asyncHandler =
  <
    P = Record<string, string>,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Record<string, unknown>,
    Locals extends Record<string, unknown> = Record<string, unknown>,
  >(
    fn: (
      req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
      res: Response<ResBody, Locals>,
      next: (err?: unknown) => void
    ) => Promise<unknown> | unknown
  ): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> =>
  (req, res, next) => {
    Promise.resolve(
      fn(
        req as Request<P, ResBody, ReqBody, ReqQuery, Locals>,
        res as Response<ResBody, Locals>,
        next as (err?: unknown) => void
      )
    ).catch(next);
  };
