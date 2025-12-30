// backend/src/controllers/auth.controllers.ts
import { Request, Response } from "express";
import { authService } from "../services/auth.service.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { user, token } = await authService.registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    if (error.message === "USER_EXISTS") {
      return res.status(409).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { user, token } = await authService.loginUser(email, password);

    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.status(500).json({ message: "Server error" });
  }
};