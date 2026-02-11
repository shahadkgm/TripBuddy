// backend/src/services/guide.service.ts

import { GuideQueryDTO, GuideRegisterDTO, GuideResponseDTO } from '../../dto/guide.dto.js';
import { IGuideRepository } from '../../repositories/interface/IGuideRepository.js';
import { Guide, GuideCreate } from '../../types/guide.type.js';
import { toGuideResponse } from '../../utils/guide.mapper.js';
import { IGuideService } from '../interface/IGuideService.js';


export class GuideService implements IGuideService {

  constructor(private guideRepository: IGuideRepository) {}

  
  async register(userId: string, data: GuideRegisterDTO, fileName?: string):Promise<Guide> {
    // const user=await this.userRepsitory.findby
    
    const existing = await this.guideRepository.findByUserId(userId);
    if (existing) throw new Error('Application already exists');
const profileData:GuideCreate={
    userId,
    
    bio: data.bio,
    hourlyRate: Number(data.hourlyRate),
    serviceArea: data.serviceArea,
    yearsOfExperience: Number(data.yearsOfExperience)||0,
    specialties:
      typeof data.specialties === 'string'
        ? JSON.parse(data.specialties)
        : data.specialties,
    avatarURL: fileName ? `/uploads/guides/${fileName}` : '',
    isVerified: false,

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

  
  async getAllVerifiedGuides(query: GuideQueryDTO):Promise<GuideResponseDTO[]> {
    const filters: Record<string,unknown>= { isVerified: true };

    if (query.destination) {
      filters.serviceArea = { $regex: query.destination, $options: 'i' };
    }

    if (query.maxPrice) {
      filters.hourlyRate = { $lte: Number(query.maxPrice) };
    }

    const guides=await this.guideRepository.findAll(filters);
    return guides.map(toGuideResponse)
  }
}