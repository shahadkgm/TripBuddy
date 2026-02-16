import { IsArray, IsBoolean, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class GuideRegisterDTO {
  @IsString()
  bio!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hourlyRate!: number;

  @IsString()
  serviceArea!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  yearsOfExperience!: number;

  @IsArray()
  @IsString({ each: true })
  specialties!: string[];
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
  hourlyRate!: number;

  @IsString()
  serviceArea!: string;

  @IsNumber()
  @Min(0)
  yearsOfExperience!: number;

  @IsArray()
  @IsString({ each: true })
  specialties!: string[];

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
