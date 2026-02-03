import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAuthService } from "../interface/IAuthservice.js"; // Fixed path
import { RegisterUserDTO, LoginDTO } from "../../dto/auth.dto.js";
import { AuthResponse } from "../../types/authResponse.js";
import { OAuth2Client } from 'google-auth-library';
import { IUserRepository } from "../../repositories/interface/IUserRepository.js";
import { MailService } from "./mail.service.js";
import crypto from "crypto";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService implements IAuthService {
  private readonly JWT_SECRET :string
  
  constructor(private userRepo:IUserRepository,private _mailService:MailService){
    if(!process.env.JWT_SECRET){
      throw new Error("JWT_SECRET IS NOT DEFINE")
    }
    this.JWT_SECRET=process.env.JWT_SECRET;
  }

  async registerUser(data: RegisterUserDTO): Promise<AuthResponse> {
    const { name, email, password } = data;

   const existingUser = await this.userRepo.findByEmail(email);

if (existingUser) {
  if (!existingUser.isVerified) {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 24 * 60 * 60 * 1000;

    await this.userRepo.updateVerificationToken(
      existingUser._id.toString(),
      verificationToken,
      expires
    );

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    console.log("resend email from backend authservice",verifyLink)

    await this._mailService.sendVerificationEmail(
      existingUser.email,
      existingUser.name,
      verifyLink
    );

    throw new Error("EMAIL_NOT_VERIFIED");
  }

  // ✅ User exists AND verified
  throw new Error("USER_EXISTS");
}


    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({
      name,
      email,
      password: hashedPassword,
      role: data.role || "user",
      isBlocked: false,
      isVerified:false,
    });

     const verificationToken = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 24 * 60 * 60 * 1000;
  await this.userRepo.updateVerificationToken(
    user._id.toString(),
    verificationToken,
    expires
  );
   const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
   console.log("verification link",verifyLink)
   await this._mailService.sendVerificationEmail(
    user.email,
    user.name,
    verifyLink
  );

// const tokens = this.generateTokens({
//   id: user._id.toString(),
//   role: user.role
// });

    return {
message: "Registration successful. Please verify your email.",
      //  tokens,
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
    
    const user = await this.userRepo.findByEmail( email );
    if (!user || !user.password) {
      throw new Error("INVALID_CREDENTIALS");
    }
    if(user.isBlocked){
      throw new Error("User_blocked")
    }
    if (!user.isVerified) {
  throw new Error("EMAIL_NOT_VERIFIED");
}
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("INVALID_CREDENTIALS");
    
      if(!user.isVerified){
        throw new Error("EMAIL_NOT_VERIFIED")
      }

const tokens = this.generateTokens({
  id: user._id.toString(),
  role: user.role
});

console.log("tokens from authservice",tokens)

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
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("INVALID_GOOGLE_TOKEN");
    }

    let user = await this.userRepo.findOrCreateGoogleUser({
       email: payload.email,
       name:payload.name||"Google user"
      });
      if(user.isBlocked){
        throw new Error("User blocked")
      }

   

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
async verifyEmail(token: string): Promise<AuthResponse> {
  const user = await this.userRepo.findByVerificationToken(token);
  console.log("user from authservice verify",user)
  if (!user) throw new Error("INVALID_TOKEN_OR_EXPIRED");

  await this.userRepo.verifyUser(user._id.toString());

  return { message: "EMAIL_VERIFIED_SUCCESSFULLY" };
}




}