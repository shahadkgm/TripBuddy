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
    depositAmount?: number;
    minMembers: number;
    status: 'planned' | 'ongoing' | 'completed' | 'cancelled' | 'finalized' | 'confirmed';
    members: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export type ITripDocument = ITrip & Document;

export interface ITripPopulated extends Omit<ITrip, 'userId' | 'members'> {
    userId: {
        _id: Types.ObjectId;
        name: string;
        email: string;
        avatarURL?: string;
        role?: string;
    };
    members: {
        _id: Types.ObjectId;
        name: string;
        email: string;
        avatarURL?: string;
    }[];
}

export type ITripPopulatedDocument = ITripPopulated & Document;

export interface ITripFilters {
    destination?: string;
    transport?: string;
    interest?: string;
}
