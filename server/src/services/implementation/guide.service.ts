// backend/src/services/guide.service.ts

import { IGuideRepository } from "../../repositories/interface/IGuideRepository.js";
import { IGuideService } from "../interface/IGuideService.js";

// import { IGuideRepository } from "../interfaces/IGuideInterface.js";

export class GuideService implements IGuideService {
// DI
  constructor(private guideRepository: IGuideRepository) {}

  
  async register(userId: string, data: any, fileName?: string) {
    const existing = await this.guideRepository.findByUserId(userId);
    if (existing) throw new Error("Application already exists");

    const profileData = {
      userId,
      bio: data.bio,
      hourlyRate: Number(data.hourlyRate),
      serviceArea: data.serviceArea,
      specialities: typeof data.specialties === 'string' ? JSON.parse(data.specialties) : data.specialties,
      avatarURL: fileName ? `/uploads/guides/${fileName}` : ''
    };

    return await this.guideRepository.create(profileData);
  }

  
  async getStatus(userId: string) {
    const profile = await this.guideRepository.findByUserId(userId);
    if (!profile) return { exists: false };
    
    return { 
      exists: true, 
      isVerified: profile.isVerified 
    };
  }

  
  async getAllVerifiedGuides(query: any) {
    const filters: any = { isVerified: true };

    if (query.destination) {
      filters.serviceArea = { $regex: query.destination, $options: 'i' };
    }

    if (query.maxPrice) {
      filters.hourlyRate = { $lte: Number(query.maxPrice) };
    }

    return await this.guideRepository.findAll(filters);
  }
}