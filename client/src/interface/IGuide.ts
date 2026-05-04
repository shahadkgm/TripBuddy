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
  languages: string[];
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  isVerified: boolean;
  yearsOfExperience?: number;
  averageRating?: number;
  reviewCount?: number;
}
