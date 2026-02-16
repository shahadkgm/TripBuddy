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
  status: string;
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
  pendingApplications: number;
}
