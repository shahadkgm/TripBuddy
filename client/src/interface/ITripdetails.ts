export interface IItineraryItem {
  day: number;
  date: Date | string;
  activities: {
    time: string;
    activity: string;
    location?: string;
    notes?: string;
  }[];
}

export interface IGuide {
  _id?: string;
  id?: string; // Some parts use id
  name?: string;
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  avatarURL?: string;
  avatar?: string;
  specialties: string[];
  yearsOfExperience?: number;
  isVerified: boolean;
  userId?: {
    _id?: string;
    name: string;
    email: string;
  };
}

import { TripStatus } from '../constants/TripStatus';

export interface ITrip {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        avatarURL?: string;
        avatar?: string;
        role: string;
        bio?: string;
      };
  title: string;
  destination: string;
  startDate: string | Date;
  endDate: string | Date;
  budget: number;
  description?: string;
  preferences: {
    travelers: number;
    accommodation: string;
    transport: string;
    interests: string[];
  };
  depositAmount?: number;
  status: TripStatus;
  members?: {
    _id: string;
    name: string;
    email: string;
    avatarURL?: string;
  }[];
  itinerary?: IItineraryItem[];
  joinDeadline: string;
  guideId?: IGuide | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITripFilters {
  destination?: string;
  transport?: string;
  interest?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTrips {
  trips: ITrip[];
  total: number;
}

export interface IGuideInvitation {
  _id: string;
  tripId: ITrip | string;
  guideId: IGuide | string;
  organizerId?: {
    _id: string;
    name: string;
    email: string;
    avatarURL?: string;
  };
  senderId?: {
    _id: string;
    name: string;
    email: string;
    avatarURL?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  organizerMessage?: string;
  guideMessage?: string;
  createdAt: string;
  updatedAt: string;
}
