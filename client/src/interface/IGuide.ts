export interface IGuide {
  _id?: string;
  id?: string;
  userId?: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
  };
  name?: string;
  bio: string;
  dailyRate: number;
  serviceArea: string;
  specialties: string[];
  avatarURL?: string;
  isVerified: boolean;
  yearsOfExperience?: number;
  averageRating?: number;
  reviewCount?: number;
}
