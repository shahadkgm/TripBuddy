// backend/src/services/guide.service.ts

import { IGuideRepository } from "../interfaces/IGuideInterface.js";

// import { IGuideRepository } from "../interfaces/IGuideInterface.js";

export class GuideService {
  // Dependency Injection: Service depends on the interface, not the model
  constructor(private guideRepository: IGuideRepository) {}

  /**
   * SOLID: Single Responsibility - Handles business logic for guide registration
   */
  async register(userId: string, data: any, fileName?: string) {
    // Use repository for data access
    const existing = await this.guideRepository.findByUserId(userId);
    if (existing) throw new Error("Application already exists");

    // Prepare clean data object
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

  /**
   * Logic to check the current status of a guide application
   */
  async getStatus(userId: string) {
    const profile = await this.guideRepository.findByUserId(userId);
    if (!profile) return { exists: false };
    
    return { 
      exists: true, 
      isVerified: profile.isVerified 
    };
  }

  /**
   * New method for the "Find Local Experts" page
   */
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