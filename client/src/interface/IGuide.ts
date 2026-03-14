export interface IGuide {
  id: string;
  userId?: {
    id: string;
    name: string;
    email: string;
  };
  name?: string;
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  specialties: string[];
  avatarURL?: string;
  isVerified: boolean;
}
