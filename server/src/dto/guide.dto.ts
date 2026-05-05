import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type, Transform } from 'class-transformer';

export class GuideRegisterDTO {
  @IsString()
  bio!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dailyRate!: number;

  @IsString()
  serviceArea!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  yearsOfExperience!: number;

  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  specialties!: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return {};
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
}

export class GuideUpdateDTO {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dailyRate?: number;

  @IsOptional()
  @IsString()
  serviceArea?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return value.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };

  @IsOptional()
  @IsString()
  avatarURL?: string;
}

export class CreateGuideDTO {
  @IsMongoId()
  userId!: string | Types.ObjectId;

  @IsString()
  name!: string;

  @IsString()
  bio!: string;

  @IsNumber()
  @Min(0)
  dailyRate!: number;

  @IsString()
  serviceArea!: string;

  @IsNumber()
  @Min(0)
  yearsOfExperience!: number;

  @IsArray()
  @IsString({ each: true })
  specialties!: string[];

  @IsArray()
  @IsString({ each: true })
  languages!: string[];

  @IsOptional()
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };

  @IsOptional()
  @IsString()
  avatarURL?: string;

  @IsBoolean()
  isVerified!: boolean;
}

export interface GuideStatusResponse {
  exists: boolean;
  isVerified?: boolean;
}

export class GuideQueryDTO {
  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

export interface GuideResponseDTO {
  id: string;
  name?: string;
  bio: string;
  dailyRate: number;
  serviceArea: string;
  specialties: string[];
  languages: string[];
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  avatarURL?: string;
  yearsOfExperience: number;
  isVerified: boolean;
  averageRating?: number;
  reviewCount?: number;
}
