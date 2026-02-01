// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { StatusCode } from '../../constants/statusCode.enum.js';
import { IUserService } from '../../services/interface/IUserService.js';
import { ForgotPasswordDTO } from '../../dto/user.dto.js';

export class UserController {
  constructor(private userService: IUserService) {}


  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(StatusCode.OK).json(users);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        message: "Failed to fetch users.", 
        error: (error as Error).message 
      });
    }
  };
 forgotPassword=async(req: Request<{},{},ForgotPasswordDTO>, res: Response):Promise<void>=> {
    try {
      console.log("its call forgot password from backend ",process.env.EMAIL_USER)
      const { email } = req.body;
      
      if (!email) {
         res.status(StatusCode.BAD_REQUEST).json({ message: "Email is required" });
         return;
      }

      const result = await this.userService.forgotPassword(email);
       res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      console.log("from forget password")
      // Return 400 or 404 depending on your error handling logic
       res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }
  async resetPassword(req: Request, res: Response) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(StatusCode.BAD_REQUEST).json({ message: "New password is required" });
        }

        const result = await this.userService.resetPassword(token, password);
        return res.status(StatusCode.OK).json(result);
    } catch (error: any) {
        return res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
}

}