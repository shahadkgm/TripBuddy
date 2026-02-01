// server/src/controllers/implementation/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { StatusCode } from "../../constants/statusCode.enum.js";
import { IAuthController } from "../interfaces/IAuthController.js";
import { IAuthService } from "../../services/interface/IAuthservice.js";

export class AuthController implements IAuthController {
  constructor(private readonly _authService: IAuthService) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "All fields are required" });
        return;
      }

      const result = await this._authService.registerUser(req.body);
      res.status(StatusCode.CREATED).json(result);
    } catch (error: any) {
      if (error.message === "USER_EXISTS") {
        res.status(StatusCode.CONFLICT).json({ message: "User already exists" });
        return;
      }
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "All fields are required" });
        return;
      }

      const result = await this._authService.loginUser({ email, password });
      // res.cookie("tokens",result.tokens,{
      //   httpOnly:true,
      //   sameSite:"none",
      //   maxAge:604800000
      // })
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      if (error.message === "INVALID_CREDENTIALS") {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Invalid email or password" });
        return;
      }
      next(error);
    }
  };

  googleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "Google token is required" });
        return;
      }

      const result = await this._authService.googleLogin(token);
      res.status(StatusCode.OK).json(result);
    } catch (error: any) {
      next(error);
    }
  };
}
