// backend/src/interfaces/IGuideInterface.ts
import { Document, Types } from 'mongoose';

/**
 * 1. The Data Interface (Matches your MongoDB Schema)
 */
export interface IGuideProfile extends Document {
  userId: Types.ObjectId|string
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  specialties: string[];
  avatarURL?: string;
  isVerified: boolean;
  lastUpdated: Date;
}

/**
 * 2. The Repository Interface (Data Access Layer)
 */
export interface IGuideRepository {
  
  findAll(filters: any): Promise<IGuideProfile[]>;

  findByUserId(userId: string): Promise<IGuideProfile | null>;

  
  create(data: Partial<IGuideProfile>): Promise<IGuideProfile>;
}


export interface IGuideService {
  getAllGuides(query: any): Promise<IGuideProfile[]>;
  checkStatus(userId: string): Promise<{ exists: boolean; isVerified: boolean }>;
}