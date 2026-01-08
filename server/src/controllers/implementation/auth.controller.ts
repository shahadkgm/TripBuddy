// server/src/controllers/implementation/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/IAuthController.js";
import { StatusCode } from "../../constants/statusCode.enum.js";

export class AuthController {
  constructor(private readonly _authService: IAuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "All fields are required" });
        return;
      }
//dto based
      const result = await this._authService.registerUser(req.body);

      res.status(StatusCode.CREATED).json({
        // message: "User registered successfully",
        ...result // result matches the interface { user, token }
      });
    } catch (error: any) {
      if (error.message === "USER_EXISTS") {
        res.status(StatusCode.CONFLICT).json({ message: "User already exists" });
        return;
      }
      next(error); 
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      console.log("email and password from  login",email,password)

      if (!email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "All fields are required" });
        return;
      }

      const result = await this._authService.loginUser({ email, password });
      console.log("result from logincontroll",result)

      res.status(StatusCode.OK).json({
        // message: "Logged in successfully",
        ...result
      });
    } catch (error: any) {
      if (error.message === "INVALID_CREDENTIALS") {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Invalid email or password" });
        return;
      }
      next(error);
    }
  }
  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Call the newly implemented service method
    const result = await this._authService.googleLogin(token);

    // Return the AuthResponse structure
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Google Auth Error:", error.message);
    next(error);
  }
};
}