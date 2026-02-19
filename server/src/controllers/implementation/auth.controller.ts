// server/src/controllers/implementation/auth.controller.ts

import { Request, Response } from 'express';
import { StatusCode } from '../../constants/statusCode.enum';
import { IAuthController } from '../interfaces/IAuthController';
import { IAuthService } from '../../services/interface/IAuthservice';
import { asyncHandler } from '../../utils/asyncHandler';
import jwt from 'jsonwebtoken';
import { AppError } from '../../utils/AppError';

interface UserPayload extends jwt.JwtPayload {
  id: string;
  role: string;
}

export class AuthController implements IAuthController {
  constructor(private readonly _authService: IAuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this._authService.registerUser(req.body);

    res.status(StatusCode.CREATED).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError( 'All fields are required',StatusCode.BAD_REQUEST);
    }

    const result = await this._authService.loginUser({ email, password });

    res.cookie('refreshToken', result.tokens?.refreshToken, {
      httpOnly: true,
      secure: false,
      // process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(StatusCode.OK).json({
      message: result.message,
      accessToken: result.tokens?.accessToken,
      user: result.user,
    });
  });

  googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      throw new AppError( 'Google token is required',StatusCode.BAD_REQUEST);
    }

    const result = await this._authService.googleLogin(token);

    res.cookie('refreshToken', result.tokens?.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(StatusCode.OK).json({
      message: result.message,
      accessToken: result.tokens?.accessToken,
      user: result.user,
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    const result = await this._authService.verifyEmail(token);

    res.status(StatusCode.OK).json(result);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new AppError('No refresh token found',StatusCode.UNAUTHORIZED );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.status(StatusCode.OK).json({ accessToken: newAccessToken });
  });
}
