export interface GuideRegisterDTO {
  bio: string;
  hourlyRate: number | string;
  serviceArea: string;
  yearsOfExperience: number | string;
  specialties: string[] | string;
}
export interface GuideStatusResponse {
  exists: boolean;
  isVerified?: boolean;
}
export interface GuideQueryDTO {
  destination?: string;
  maxPrice?: number | string;
}
export interface GuideResponseDTO {
  id: string;
  name?: string;
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  specialities: string[];
  avatarURL?: string;
  isVerified: boolean;
}

