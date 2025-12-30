// backend/src/services/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret";

  async registerUser(data: any) {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("USER_EXISTS");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = this.generateToken(user._id.toString());

    return { user, token };
  }

  async loginUser(email: string, password: unknown) {
    const user = await User.findOne({ email });
if (!user || !user.password) {
    throw new Error("INVALID_CREDENTIALS");
  }
    const isMatch = await bcrypt.compare(password as string, user.password);
    if (!isMatch) throw new Error("INVALID_CREDENTIALS");

    const token = this.generateToken(user._id.toString());

    return { user, token };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ id: userId }, this.JWT_SECRET, { expiresIn: "7d" });
  }
}

export const authService = new AuthService();