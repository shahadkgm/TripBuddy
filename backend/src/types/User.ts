// backend/src/types/User.ts
import { Document } from 'mongoose';

export interface IUser {
//   _id?: string;
  name: string;
  email: string;
  password?: string;
  passwordResetToken?: string;
  passwordResetExpires?: number | Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {}