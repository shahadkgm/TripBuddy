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
  dailyRate: number;
  serviceArea: string;
  specialties: string[];
  avatarURL?: string;
  certificateUrl?: string;
   isVerified: boolean;
   status: string;
   rejectionReason?: string;
   createdAt: string;
  kycData?: {
    status: string;
    filePath: string;
    rejectionReason?: string | null;
  };
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

export class RejectGuideDTO {
  @IsNotEmpty({ message: 'Reason is required' })
  @IsString()
  reason!: string;
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

export interface RevenueStatsDTO {
  totalRevenue: number;
  totalRefunds: number;
  escrowedAmount: number;
  totalCount: number;
  platformCommission: number;
  netRevenue: number;
  monthlyTrend: {
    _id: string;
    revenue: number;
    count: number;
  }[];
  byPaymentType: {
    _id: string;
    total: number;
    count: number;
  }[];
  topTrips: {
    _id: string;
    revenue: number;
    transactions: number;
    title: string;
    destination: string;
  }[];
}
