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
}