import { RegisterUserDTO } from '../../dto/auth.dto';
import { RegisterUserResponseDTO } from '../../dto/user.dto';
import { IUser } from '../../types/user.type';

export interface IUserService {
  registerUser(userData: RegisterUserDTO): Promise<RegisterUserResponseDTO>;
  getAllUsers(): Promise<IUser[]>;
  forgotPassword(email: string): Promise<{ message: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ message: string }>;
  updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ message: string }>;
}