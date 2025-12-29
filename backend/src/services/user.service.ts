
  // src/services/user.service.ts
import { IUserRepository } from '../interfaces/IUserRepository.js';
import { RegisterUserDTO } from '../types/user.dto.js';
import crypto from 'crypto';

export class UserService {
  // We include mailService here so we can send the email
  constructor(
    private userRepository: IUserRepository,
    private mailService: any 
  ) {}

  async registerUser(userData: RegisterUserDTO) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const newUser = await this.userRepository.create(userData);
    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };
  }
  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async forgotPassword(email: string) {
   // console.log("from user service",email)
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");

    // 2. Generate and hash the token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = Date.now() + 3600000; // 1 hour
//console.log("from user service",resetToken,hashedToken,expires)
 
await this.userRepository.updateResetToken(user._id, hashedToken, expires);

    // 4. Send the email via mailService
    await this.mailService.sendResetEmail(user.email, resetToken);

    return { message: "Reset link sent to email" };
  }
  async resetPassword(token: string, newPassword: string) {
  // 1. Hash the incoming token to compare with DB
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // 2. Find user with valid token and not expired
  const user = await this.userRepository.findByResetToken(hashedToken);
  
  if (!user || user.passwordResetExpires < Date.now()) {
    throw new Error("Token is invalid or has expired.");
  }

  // 3. Update password and clear reset fields
  // Note: Your UserRepository needs a method to update password
  await this.userRepository.updatePassword(user._id, newPassword);

  return { message: "Password updated successfully" };
}
}