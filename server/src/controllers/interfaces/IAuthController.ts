import { RequestHandler } from 'express';

export interface IAuthController {
  register: ControllerFn;
  login: ControllerFn;
  googleLogin: ControllerFn;
  verifyEmail: ControllerFn;
  refreshToken: ControllerFn;
}

type ControllerFn = RequestHandler;
