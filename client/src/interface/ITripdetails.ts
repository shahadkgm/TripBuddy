// client/src/auth/interface/ITripdetails.ts
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
    avatar?: string; // venel pinne avatar add aaakka 
  };
  status: 'active' | 'completed' | 'cancelled';
  preferences?: {
    travelers: number;
    transport: string;
    interests: string[];
  };
}