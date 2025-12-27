// src/modules/auth/interface/ITripdetails.ts
export interface ITrip {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  budget: number;
  tripImage?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string; // If you add avatars to your User model
  };
  status: 'active' | 'completed' | 'cancelled';
  // Include preferences if you store them in description or a separate field
  preferences?: {
    travelers: number;
    transport: string;
    interests: string[];
  };
}