import { Document, Types } from 'mongoose';

export interface ITripPreferences {
    travelers: number;
    accommodation: string;
    transport: string;
    interests: string[];
}

export interface ITrip {
    userId: Types.ObjectId;
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    budget?: number;
    description?: string;
    preferences: ITripPreferences;
    status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
    members: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export type ITripDocument = ITrip & Document;

export interface ITripFilters {
    destination?: string;
    transport?: string;
    interest?: string;
}
