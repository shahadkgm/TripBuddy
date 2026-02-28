import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import { IAuthService } from '../interface/IAuthservice';
import { IUserRepository } from '../../domain/repositories/interface/IUserRepository';
import { MailService } from './mail.service';
import { UserMapper } from '../../utils/userMapper';
import { RegisterUserDTO, LoginDTO } from '../../dto/auth.dto';
import { AuthResponse } from '../../types/authResponse';

import { AppError } from '../../utils/AppError';
import { StatusCode } from '../../constants/statusCode.enum';
import { IUser } from '../../types/user.type';
import { logger } from '../../utils/logger';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService implements IAuthService {
  private readonly JWT_SECRET: string;

  constructor(
    private userRepo: IUserRepository,
    private _mailService: MailService
  ) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not defined');
    }

    this.JWT_SECRET = process.env.JWT_SECRET;
  }

  // =================================================
  // REGISTER
  // =================================================
  async registerUser(data: RegisterUserDTO): Promise<AuthResponse> {
    logger.info('Register attempt:', data.email);

    const existingUser = await this.userRepo.findByEmail(data.email);

    if (existingUser) {
      logger.warn('Register failed: user exists', data.email);

      if (!existingUser.isVerified) {
        await this.resendVerification(existingUser);
      }

      throw new AppError('User already exists', StatusCode.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepo.create({
      ...data,
      password: hashedPassword,
      role: data.role || 'user',
      isBlocked: false,
      isVerified: false,
    });

    await this.sendVerification(user);

    logger.info('User registered successfully:', user.email);

    return {
      message: 'Registration successful. Please verify your email.',
      user: UserMapper.toResponseDTO(user),
    };
  }

  // =================================================
  // LOGIN
  // =================================================
  async loginUser(data: LoginDTO): Promise<AuthResponse> {
    logger.info('Login attempt:', data.email);

    const user = await this.userRepo.findByEmail(data.email);

    if (!user || !user.password) {
      throw new AppError('Invalid credentials', StatusCode.UNAUTHORIZED);
    }

    if (user.isBlocked) {
      throw new AppError('User blocked', StatusCode.FORBIDDEN);
    }

    if (!user.isVerified) {
      throw new AppError('Please verify your email', StatusCode.FORBIDDEN);
    }

    const match = await bcrypt.compare(data.password, user.password);

    if (!match) {
      throw new AppError('Invalid credentials', StatusCode.UNAUTHORIZED);
    }

    const tokens = this.generateTokens({
      id: user._id.toString(),
      role: user.role,
    });

    logger.info('Login success:', user.email);

    return {
      message: 'Logged in successfully',
      tokens,
      user: UserMapper.toResponseDTO(user),
    };
  }

  // =================================================
  // GOOGLE LOGIN
  // =================================================
  async googleLogin(token: string): Promise<AuthResponse> {
    logger.info('Google login attempt');

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new AppError('Invalid Google token', StatusCode.UNAUTHORIZED);
    }

    const user = await this.userRepo.findOrCreateGoogleUser({
      email: payload.email,
      name: payload.name || 'Google User',
    });

    if (user.isBlocked) {
      throw new AppError('User blocked', StatusCode.FORBIDDEN);
    }

    const tokens = this.generateTokens({
      id: user._id.toString(),
      role: user.role,
    });

    logger.info('Google login success:', payload.email);

    return {
      message: 'Google login successful',
      tokens,
      user: UserMapper.toResponseDTO(user),
    };
  }

  // =================================================
  // VERIFY EMAIL
  // =================================================
  async verifyEmail(token: string): Promise<AuthResponse> {
    logger.info('Email verification attempt');

    const user = await this.userRepo.findByVerificationToken(token);

    if (!user) {
      throw new AppError('Invalid or expired token', StatusCode.BAD_REQUEST);
    }

    await this.userRepo.verifyUser(user._id.toString());

    logger.info('Email verified:', user.email);

    return { message: 'Email verified successfully' };
  }

  async refreshToken(token: string): Promise<string> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { id: string, role: string };
      const user = await this.userRepo.findById(decoded.id);

      if (!user) {
        throw new AppError('User not found', StatusCode.UNAUTHORIZED);
      }

      if (user.isBlocked) {
        throw new AppError('User blocked', StatusCode.FORBIDDEN);
      }

      const { accessToken } = this.generateTokens({
        id: user._id.toString(),
        role: user.role,
      });

      return accessToken;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid refresh token', StatusCode.UNAUTHORIZED);
    }
  }

  // =================================================
  // HELPERS
  // =================================================
  private generateTokens(user: { id: string; role: string }) {
    const accessTokenOptions: jwt.SignOptions = {
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRE as jwt.SignOptions['expiresIn']) || '15m'
    };

    const refreshTokenOptions: jwt.SignOptions = {
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRE as jwt.SignOptions['expiresIn']) || '7d'
    };

    return {
      accessToken: jwt.sign(user, this.JWT_SECRET as jwt.Secret, accessTokenOptions),
      refreshToken: jwt.sign(user, this.JWT_SECRET as jwt.Secret, refreshTokenOptions),
    };
  }

  private async sendVerification(user: IUser) {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 24 * 60 * 60 * 1000;

    await this.userRepo.updateVerificationToken(
      user._id.toString(),
      token,
      expires
    );

    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    console.log('link for get', link);

    logger.info('Sending verification email:', user.email);

    await this._mailService.sendVerificationEmail(
      user.email,
      user.name,
      link
    );
  }

  private async resendVerification(user: IUser): Promise<never> {
    logger.warn('Resending verification email:', user.email);

    await this.sendVerification(user);

    throw new AppError('Verification email resent', StatusCode.OK);
  }
}
