// backend/src/types/User.ts
import { Document } from 'mongoose';

export interface IUser {
  // _id: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "guide" | "admin";
  passwordResetToken?: string;
  passwordResetExpires?: number | Date;
  isBlocked: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {}