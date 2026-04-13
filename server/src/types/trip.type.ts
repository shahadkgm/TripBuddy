import { Document, Types } from 'mongoose';

export interface ITripPreferences {
    travelers: number;
    accommodation: string;
    transport: string;
    interests: string[];
}

export interface IItineraryItem {
    day: number;
    date: Date;
    activities: {
        time: string;
        activity: string;
        location?: string;
        notes?: string;
    }[];
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
    guideId?: Types.ObjectId | null;
    itinerary?: IItineraryItem[];
    joinDeadline: Date;
    poolBalance: number;
    createdAt: Date;
    updatedAt: Date;
}

export type ITripDocument = ITrip & Document;

export interface ITripPopulated extends Omit<ITrip, 'userId' | 'members' | 'guideId'> {
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
    guideId?: {
        _id: Types.ObjectId;
        name: string;
        bio: string;
        hourlyRate: number;
        serviceArea: string;
        avatarURL?: string;
        specialties: string[];
        isVerified: boolean;
        userId?: { name: string; email: string };
    } | null;
}

export type ITripPopulatedDocument = ITripPopulated & Document;

export interface ITripFilters {
    destination?: string;
    transport?: string;
    interest?: string;
}
