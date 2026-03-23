// backend/src/types/User.ts

import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  id: string;

  name: string;
  email: string;
  password?: string;

  role: 'user' | 'guide' | 'admin';

  isBlocked: boolean;
  isVerified: boolean;
  walletBalance: number;

  verificationToken?: string;
  verificationTokenExpires?: Date;

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  createdAt?: Date;
  updatedAt?: Date;

  avatarURL?: string;
  bio?: string;
  hourlyRate?: number;
  serviceArea?: string;
  yearsOfExperience?: number;
  kyc?: {
    status: string;
    filePath: string;
    rejectionReason?: string | null;
  };
}


// export interface IUserDocument extends IUser, Document {}