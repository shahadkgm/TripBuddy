import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import { IAuthService } from '../interface/IAuthservice.js';
import { IUserRepository } from '../../repositories/interface/IUserRepository.js';
import { MailService } from './mail.service.js';
import { UserMapper } from '../../utils/userMapper.js';
import { RegisterUserDTO, LoginDTO } from '../../dto/auth.dto.js';
import { AuthResponse } from '../../types/authResponse.js';

import { AppError } from '../../utils/AppError.js';
import { StatusCode } from '../../constants/statusCode.enum.js';
import { IUser } from '../../types/user.type.js';
import { logger } from '../../utils/logger.js';

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
     logger. warn('Register failed: user exists', data.email);

      if (!existingUser.isVerified) {
        await this.resendVerification(existingUser);
      }

      throw new AppError( 'User already exists',StatusCode.CONFLICT);
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
      throw new AppError( 'Invalid credentials',StatusCode.UNAUTHORIZED);
    }

    if (user.isBlocked) {
      throw new AppError( 'User is blocked',StatusCode.FORBIDDEN);
    }

    if (!user.isVerified) {
      throw new AppError( 'Please verify your email',StatusCode.FORBIDDEN);
    }

    const match = await bcrypt.compare(data.password, user.password);

    if (!match) {
      throw new AppError('Invalid credentials',StatusCode.UNAUTHORIZED );
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
   logger. info('Google login attempt');

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new AppError('Invalid Google token',StatusCode.UNAUTHORIZED);
    }

    const user = await this.userRepo.findOrCreateGoogleUser({
      email: payload.email,
      name: payload.name || 'Google User',
    });

    if (user.isBlocked) {
      throw new AppError( 'User is blocked',StatusCode.FORBIDDEN);
    }

    const tokens = this.generateTokens({
      id: user._id.toString(),
      role: user.role,
    });

   logger. info('Google login success:', payload.email);

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
   logger. info('Email verification attempt');

    const user = await this.userRepo.findByVerificationToken(token);

    if (!user) {
      throw new AppError( 'Invalid or expired token',StatusCode.BAD_REQUEST);
    }

    await this.userRepo.verifyUser(user._id.toString());

   logger. info('Email verified:', user.email);

    return { message: 'Email verified successfully' };
  }

  // =================================================
  // HELPERS
  // =================================================
  private generateTokens(user: { id: string; role: string }) {
    return {
      accessToken: jwt.sign(user, this.JWT_SECRET, { expiresIn: '15m' }),
      refreshToken: jwt.sign(user, this.JWT_SECRET, { expiresIn: '7d' }),
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

   logger. info('Sending verification email:', user.email);

    await this._mailService.sendVerificationEmail(
      user.email,
      user.name,
      link
    );
  }

  private async resendVerification(user: IUser): Promise<never>
 {
   logger. warn('Resending verification email:', user.email);

    await this.sendVerification(user);

    throw new AppError('Verification email resent',StatusCode.OK );
  }
}
