import { RegisterUserDTO } from '../../types/auth.dto.js';

export interface IUserService {
  registerUser(userData: RegisterUserDTO): Promise<any>;
  getAllUsers(): Promise<any[]>;
  forgotPassword(email: string): Promise<{ message: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ message: string }>;
}