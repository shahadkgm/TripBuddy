import { Request, Response } from 'express';
import { IUserService } from '../../services/interface/IUserService';
import { ForgotPasswordDTO } from '../../dto/user.dto';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';
import { StatusCode } from '../../constants/statusCode.enum';
import { AuthRequest } from '../../types/authRequest';

import { UserMapper } from '../../utils/userMapper';
import { BaseController } from './base.controller';

export class UserController extends BaseController {
  constructor(private readonly _userService: IUserService) {
    super();
  }

  getUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await this._userService.getAllUsers();
    this.sendSuccess(res, users, 'Users fetched successfully');
  });

  forgotPassword = asyncHandler(
    async (req: Request<{}, {}, ForgotPasswordDTO>, res: Response) => {
      const { email } = req.body;
      const result = await this._userService.forgotPassword(email);
      this.sendSuccess(res, result, 'Reset email sent successfully');
    }
  );

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;
    const result = await this._userService.resetPassword(token, password);
    this.sendSuccess(res, result, 'Password reset successfully');
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    if (!userId) {
      throw new AppError('User not authenticated', StatusCode.UNAUTHORIZED);
    }
    const updatedUser = await this._userService.updateUser(userId, req.body);
    const response = UserMapper.toResponseDTO(updatedUser);
    this.sendSuccess(res, response, 'Profile updated successfully');
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    if (!userId) {
      throw new AppError('User not authenticated', StatusCode.UNAUTHORIZED);
    }
    const { oldPassword, newPassword } = req.body;
    const result = await this._userService.changePassword(userId, oldPassword, newPassword);
    this.sendSuccess(res, result, 'Password changed successfully');
  });

  getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this._userService.getUserProfile(id);
    const response = UserMapper.toResponseDTO(user);
    this.sendSuccess(res, response, 'User profile fetched successfully');
  });

}
