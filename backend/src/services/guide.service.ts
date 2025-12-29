// backend/src/services/guide.service.ts
import GuideProfile from '../models/guide.model.js';
import User from '../models/user.models.js';

export class GuideService {
  /**
   * SOLID: Single Responsibility - Handles the business logic of registration
   */
  async register(userId: string, data: any, fileName?: string) {
    const existing = await GuideProfile.findOne({ userId });
    if (existing) throw new Error("Application already exists");

    const newProfile = new GuideProfile({
      userId,
      bio: data.bio,
      hourlyRate: Number(data.hourlyRate),
      serviceArea: data.serviceArea,
      specialities: JSON.parse(data.specialties),
      avatarURL: fileName ? `/uploads/guides/${fileName}` : ''
    });

    await newProfile.save();
    // We don't change the role to 'guide' until the admin verifies them
    return newProfile;
  }

  /**
   * Logic to check the current status of a guide application
   */
  async getStatus(userId: string) {
    const profile = await GuideProfile.findOne({ userId });
    if (!profile) return { exists: false };
    
    return { 
      exists: true, 
      isVerified: profile.isVerified 
    };
  }
}

export const guideService = new GuideService();