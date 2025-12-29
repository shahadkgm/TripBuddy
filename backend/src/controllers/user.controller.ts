// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';

export class UserController {
  // Injecting the interface, not the concrete class
  constructor(private userService: UserService) {}

  registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      
      const newUser = await this.userService.registerUser({ email, name, password });

      res.status(201).json({
        message: "User registered successfully",
        user: newUser
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: "Failed to register user.", 
          error: (error as Error).message 
        });
      }
    }
  };

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch users.", 
        error: (error as Error).message 
      });
    }
  };
async forgotPassword(req: Request, res: Response) {
    try {
      console.log("its call forgot password from backend ",process.env.EMAIL_USER)
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const result = await this.userService.forgotPassword(email);
      return res.status(200).json(result);
    } catch (error: any) {
      // Return 400 or 404 depending on your error handling logic
      return res.status(400).json({ message: error.message });
    }
  }
  async resetPassword(req: Request, res: Response) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "New password is required" });
        }

        const result = await this.userService.resetPassword(token, password);
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
}

}