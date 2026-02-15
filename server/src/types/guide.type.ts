import { Types } from 'mongoose';

export interface Guide {
  _id: Types.ObjectId;
  userId: Types.ObjectId | {
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
};
// Ensure GuideCreate matches exactly what the service sends
export interface GuideCreate {
  userId: Types.ObjectId;
  name: string;
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  yearsOfExperience: number;
  specialties: string[];
  avatarURL?: string;
  isVerified: boolean;
}
