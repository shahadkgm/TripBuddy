import { IsString, IsEmail, IsBoolean, IsOptional, IsEnum, MinLength, Matches } from 'class-validator';
import { IsStrongPassword } from './auth.dto';

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
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Password must include at least one letter and one number' })
  @IsStrongPassword({ message: 'Your password is too weak' })
  password!: string;
}

export class ChangePasswordDTO {
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  oldPassword!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Matches(/^(?=. *[A-Za-z])(?=.*\d).+$/, { message: 'Password must include at least one letter and one number' })
  @IsStrongPassword({ message: 'Your password is too weak' })
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
  hourlyRate?: number; // Keep for legacy if needed, but dailyRate is preferred
  dailyRate?: number;
  serviceArea?: string;
  yearsOfExperience?: number;
  kycStatus?: string;
  kycDocument?: string;
  kycRejectionReason?: string | null;
  walletBalance: number;
  guideProfile?: {
    _id: string;
    dailyRate: number;
    serviceArea: string;
    bio: string;
    yearsOfExperience: number;
    specialties: string[];
    languages: string[];
    socialLinks?: {
      instagram?: string;
      linkedin?: string;
      website?: string;
    };
    avatarURL?: string;
  } | null;
}

export interface RegisterUserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: string;
}
