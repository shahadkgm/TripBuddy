// src/interfaces/IUserRepository.ts
import { IUser, IUserDocument } from '../../types/user.type.js';

export interface IUserRepository {
  create(userData: Partial<IUser>): Promise<IUserDocument>;
  findByEmail(email: string): Promise<IUserDocument|null>;
  findAll(): Promise<IUserDocument[]>;
  updateResetToken(userId: string, token: string, expires: number): Promise<void>;
  findByResetToken(hashedToken: string): Promise<IUserDocument|null>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
findOrCreateGoogleUser(data:{
  email:string;
  name:string;
}):Promise<IUserDocument>
}