// src/interfaces/IUserRepository.ts
import { IUser } from '../types/User.js';

export interface IUserRepository {
  create(userData: IUser): Promise<any>;
  findByEmail(email: string): Promise<any>;
  findAll(): Promise<any[]>;
  updateResetToken(userId: string, token: string, expires: number): Promise<void>;
  findByResetToken(hashedToken: string): Promise<any>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
}