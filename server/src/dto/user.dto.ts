import { IsString, IsEmail, IsBoolean, IsOptional, IsEnum, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(['user', 'guide', 'admin'])
  role?: 'user' | 'guide' | 'admin';

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class GoogleUserDTO {
  @IsEmail()
  email!: string;

  @IsString()
  name!: string;
}

export class ForgotPasswordDTO {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDTO {
  @IsString()
  @MinLength(6)
  password!: string;
}

export class ChangePasswordDTO {
  @IsString()
  @MinLength(6)
  oldPassword!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'guide' | 'admin';
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
  avatarURL?: string;
  bio?: string;
  hourlyRate?: number;
  serviceArea?: string;
  yearsOfExperience?: number;
  kycStatus?: string;
  kycDocument?: string;
  kycRejectionReason?: string | null;
  walletBalance: number;
  guideProfile?: {
    _id: string;
    hourlyRate: number;
    serviceArea: string;
    bio: string;
  } | null;
}

export interface RegisterUserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}
