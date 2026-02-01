import { Types } from "mongoose";

// src/domain/entities/GuideProfile.ts
export interface IGuideProfile {
  userId:Types.ObjectId| string;
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  specialities: string[];
  avatarURL?: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
