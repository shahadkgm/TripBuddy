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
  dailyRate: number;
  serviceArea: string;
  certificateUrl?: string;
  yearsOfExperience: number;
  specialties: string[];
  languages: string[];
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  avatarURL?: string;
  isVerified: boolean;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  averageRating?: number;
  reviewCount?: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}
