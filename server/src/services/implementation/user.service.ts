import { IUserRepository } from '../../repositories/interface/IUserRepository.js';
import { IUserService } from '../interface/IUserService.js';
import { IMailService } from '../interface/IMailService.js';
import { RegisterUserDTO } from '../../dto/auth.dto.js';
import { RegisterUserResponseDTO } from '../../dto/user.dto.js';
import { AppError } from '../../utils/AppError.js';
import { StatusCode } from '../../constants/statusCode.enum.js';
import crypto from 'crypto';

export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private mailService: IMailService
  ) { }

  async registerUser(
    userData: RegisterUserDTO
  ): Promise<RegisterUserResponseDTO> {
    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new AppError(
        'User with this email already exists',
        StatusCode.CONFLICT
      );
    }

    const newUser = await this.userRepository.create({
      ...userData,
      role: userData.role || 'user',
      isBlocked: false,
    });

    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role || 'user',
    };
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('User not found', StatusCode.NOT_FOUND);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const expires = Date.now() + 3600000;

    await this.userRepository.updateResetToken(
      user._id.toString(),
      hashedToken,
      expires
    );

    await this.mailService.sendResetEmail(user.email, resetToken);

    return { message: 'Reset link sent to email' };
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.userRepository.findByResetToken(hashedToken);

    if (
      !user ||
      !user.passwordResetExpires ||
      new Date(user.passwordResetExpires).getTime() < Date.now()
    ) {
      throw new AppError(
        'Token is invalid or expired',
        StatusCode.BAD_REQUEST
      );
    }

    await this.userRepository.updatePassword(user._id.toString(), newPassword);

    return { message: 'Password updated successfully' };
  }
}
