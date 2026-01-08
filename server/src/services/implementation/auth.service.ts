import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/user.models.js";
import { IAuthService } from "../interface/IAuthservice.js"; // Fixed path
import { RegisterUserDTO, LoginDTO } from "../../types/auth.dto.js";
import { AuthResponse } from "../../types/authResponse.js";
import { OAuth2Client } from 'google-auth-library';


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService implements IAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret";

  async registerUser(data: RegisterUserDTO): Promise<AuthResponse> {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("USER_EXISTS");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: data.role || "user",
      isBlocked: false
    });

const tokens = this.generateTokens({
  id: user._id.toString(),
  role: user.role
});

    return {
      message: "User registered successfully",
      tokens,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as "user" | "guide" | "admin",
        isBlocked:user.isBlocked
      }
    };
  }

  async loginUser(data: LoginDTO): Promise<AuthResponse> {
    const { email, password } = data;
    
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("INVALID_CREDENTIALS");

const tokens = this.generateTokens({
  id: user._id.toString(),
  role: user.role
});

    return {
      message: "Logged in successfully",
      tokens,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as "user" | "guide" | "admin",
        isBlocked: user.isBlocked 
      }
    };
  }

  // private generateTokens(userId: string) {
  //   return {
  //     accessToken: jwt.sign({ id: userId }, this.JWT_SECRET, { expiresIn: "15m" }),
  //     refreshToken: jwt.sign({ id: userId }, this.JWT_SECRET, { expiresIn: "7d" })
  //   };
  // },
  async googleLogin(token: string): Promise<AuthResponse> {
    // 2. Verify Google Token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("INVALID_GOOGLE_TOKEN");
    }

    // 3. Find or Create User
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Create user if they don't exist
      user = await User.create({
        name: payload.name,
        email: payload.email,
        role: "user",
        isVerified: true ,
        isBlocked:false 
      });
    }

    // 4. Reuse your existing token logic
const tokens = this.generateTokens({
  id: user._id.toString(),
  role: user.role
});

    return {
      message: "Google login successful",
      tokens,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as "user" | "guide" | "admin",
        isBlocked:false
      }
    };
  }

  private generateTokens(user: { id: string; role: string }) {
  return {
    accessToken: jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      this.JWT_SECRET,
      { expiresIn: "15m" }
    ),
    refreshToken: jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      this.JWT_SECRET,
      { expiresIn: "7d" }
    )
  };
}



}