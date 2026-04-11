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
  totalTrips: number;
  totalPayments: number;
}

import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateUserBlockDTO {
  @IsNotEmpty({ message: 'Blocked status is required' })
  @IsBoolean({ message: 'Blocked must be a boolean' })
  blocked!: boolean;
}

export class ApproveKYCDTO {
  @IsNotEmpty({ message: 'Status is required' })
  @IsString()
  @IsEnum(['approved', 'rejected'], { message: 'Status must be either approved or rejected' })
  status!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdatePaymentStatusDTO {
  @IsNotEmpty({ message: 'Status is required' })
  @IsString()
  status!: string;
}

export class UpdateTripStatusDTO {
  @IsNotEmpty({ message: 'Status is required' })
  @IsString()
  status!: string;
}
