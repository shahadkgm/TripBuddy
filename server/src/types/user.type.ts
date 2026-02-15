// backend/src/types/User.ts

import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;

  name: string;
  email: string;
  password?: string;

  role: 'user' | 'guide' | 'admin';

  isBlocked: boolean;
  isVerified: boolean;

  verificationToken?: string;
  verificationTokenExpires?: Date;

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}


// export interface IUserDocument extends IUser, Document {}