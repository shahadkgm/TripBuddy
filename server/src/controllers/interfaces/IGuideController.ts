// server/src/constroller/interfaces/IGuideInterface.ts
import { Document, Types } from 'mongoose';


export interface IGuideProfile extends Document {
  userId: Types.ObjectId|string
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  specialities: string[];
  avatarURL?: string;
  isVerified: boolean;
  lastUpdated: Date;
}

