//server/src/services/user.service.ts
import { IUserRepository } from '../../repositories/interface/IUserRepository.js';
import { IUserService } from '../interface/IUserService.js';
import { IMailService } from '../interface/IMailService.js'; 
import { RegisterUserDTO } from '../../types/auth.dto.js';
import crypto from 'crypto';



export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private mailService: IMailService 
  ) {}

  async registerUser(userData: RegisterUserDTO) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const newUser = await this.userRepository.create({
      ...userData,
      role:userData.role||"user",
      isBlocked:false

      });
    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role || "user",
      
    };
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = Date.now() + 3600000; 

    await this.userRepository.updateResetToken(user._id, hashedToken, expires);

    // Send Email
    await this.mailService.sendResetEmail(user.email, resetToken);

    return { message: "Reset link sent to email" };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository.findByResetToken(hashedToken);
    
    if (!user || user.passwordResetExpires < Date.now()) {
      throw new Error("Token is invalid or has expired.");
    }

    await this.userRepository.updatePassword(user._id, newPassword);

    return { message: "Password updated successfully" };
  }
}