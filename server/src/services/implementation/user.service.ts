import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { IUserService } from '../interface/IUserService';
import { IMailService } from '../interface/IMailService';
import { RegisterUserDTO } from '../../dto/auth.dto';
import { RegisterUserResponseDTO } from '../../dto/user.dto';
import { AppError } from '../../utils/AppError';
import { StatusCode } from '../../constants/statusCode.enum';
import crypto from 'crypto';

export class UserService implements IUserService {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _mailService: IMailService
  ) { }

  async registerUser(
    userData: RegisterUserDTO
  ): Promise<RegisterUserResponseDTO> {
    const existingUser = await this._userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new AppError(
        'User with this email already exists',
        StatusCode.CONFLICT
      );
    }

    const newUser = await this._userRepository.create({
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
    return this._userRepository.findAll();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('User not found', StatusCode.NOT_FOUND);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const expires = Date.now() + 3600000;

    await this._userRepository.updateResetToken(
      user._id.toString(),
      hashedToken,
      expires
    );

    await this._mailService.sendResetEmail(user.email, resetToken);

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

    const user = await this._userRepository.findByResetToken(hashedToken);

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

    await this._userRepository.updatePassword(user._id.toString(), newPassword);

    return { message: 'Password updated successfully' };
  }
}
