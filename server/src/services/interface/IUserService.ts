import { RegisterUserDTO } from '../../dto/auth.dto.js';
import { RegisterUserResponseDTO } from '../../dto/user.dto.js';
import { IUser } from '../../types/user.type.js';

export interface IUserService {
  registerUser(userData: RegisterUserDTO): Promise<RegisterUserResponseDTO>;
  getAllUsers(): Promise<IUser[]>;
  forgotPassword(email: string): Promise<{ message: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ message: string }>;
}