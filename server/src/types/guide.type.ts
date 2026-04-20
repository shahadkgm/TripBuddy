import { Types } from 'mongoose';

export interface IGuide {
  _id: Types.ObjectId;
  userId:
    | Types.ObjectId
    | {
        _id: Types.ObjectId;
        name: string;
        email: string;
      };
  name: string;
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  certificateUrl?: string;
  yearsOfExperience: number;
  specialties: string[];
  avatarURL?: string;
  isVerified: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}
