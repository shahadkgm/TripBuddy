import { Types } from 'mongoose';

export interface Guide {
  _id: string|Types.ObjectId;
userId:
  | string
  | Types.ObjectId
  | {
      _id: string;
      name: string;
      email: string;
    };
  name: string;
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  yearsOfExperience: number;
  specialities: string[];
  avatarURL: string;
  isVerified: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
};
// Ensure GuideCreate matches exactly what the service sends
export interface GuideCreate {
  userId:  string;
  name:string;
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  yearsOfExperience: number;
  specialties: string[];
  avatarURL?: string;
  isVerified: boolean;
}
