import { UserResponseDTO } from './user.dto';

export interface UserListDTO {
  users: UserResponseDTO[];
  totalUsers: number;
  totalPages: number;
}

export interface AdminGuideResponseDTO {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  bio: string;
  hourlyRate: number;
  serviceArea: string;
  specialties: string[];
  avatarURL?: string;
  certificateUrl?: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  yearsOfExperience: number;
}

export interface GuideListDTO {
  guides: AdminGuideResponseDTO[];
  totalPages: number;
  totalGuides: number;
  currentPage: number;
}


export interface DashboardStatsDTO {
  totalUsers: number;
  totalGuides: number;
  pendingApplications: number;
}
