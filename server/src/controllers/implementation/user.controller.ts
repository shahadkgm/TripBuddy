import { Request, Response } from 'express';
import { StatusCode } from '../../constants/statusCode.enum';
import { IUserService } from '../../services/interface/IUserService';
import { ForgotPasswordDTO } from '../../dto/user.dto';
import { asyncHandler } from '../../utils/asyncHandler';

export class UserController {
  constructor(private userService: IUserService) {}

  getUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await this.userService.getAllUsers();

    res.status(StatusCode.OK).json(users);
  });

  forgotPassword = asyncHandler(
    async (req: Request<{}, {}, ForgotPasswordDTO>, res: Response) => {
      const { email } = req.body;

      const result = await this.userService.forgotPassword(email);

      res.status(StatusCode.OK).json(result);
    }
  );

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    const result = await this.userService.resetPassword(token, password);

    res.status(StatusCode.OK).json(result);
  });
}
