import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

export interface AuthRequest<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}
