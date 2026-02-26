import { Request, Response } from 'express';
import { StatusCode } from '../../constants/statusCode.enum';
import { IUserService } from '../../services/interface/IUserService';
import { ForgotPasswordDTO } from '../../dto/user.dto';
import { asyncHandler } from '../../utils/asyncHandler';

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
}
