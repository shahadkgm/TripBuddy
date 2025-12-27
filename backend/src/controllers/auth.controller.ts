// backend/src/controllers/auth.controllers.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; 
import User from "../models/user.models.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Validate
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Check existing user
    const existingUser = await User.findOne({ email });  
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_fallback_secret", // Ensure this is in your .env
      { expiresIn: "7d" } // Token valid for 7 days
    );

    // 6️⃣ Send response with Token
    res.status(201).json({
      message: "User registered successfully",
      token, // Include the token here
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Find the user by email
    // Use .select("+password") if your schema has { select: false } for passwords
    const user = await User.findOne({ email });
    if (!user) {
      // Use a generic message for security (don't reveal if email exists)
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3️⃣ Compare the typed password with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4️⃣ Generate JWT Token (Same logic as register)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_fallback_secret",
      { expiresIn: "7d" }
    );

    // 5️⃣ Send response
    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};