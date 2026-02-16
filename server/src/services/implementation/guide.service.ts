import { CreateGuideDTO, GuideQueryDTO, GuideRegisterDTO, GuideResponseDTO } from '../../dto/guide.dto';
import { IGuide } from '../../types/guide.type';
import { IGuideRepository } from '../../repositories/interface/IGuideRepository';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { toGuideResponse } from '../../utils/guide.mapper';
import { logger } from '../../utils/logger';
import { IGuideService } from '../interface/IGuideService';


export class GuideService implements IGuideService {

  constructor(private guideRepository: IGuideRepository, private userRepository: IUserRepository) { }


  async register(userId: string, data: GuideRegisterDTO, fileName?: string): Promise<IGuide> {
    // const user=await this.userRepsitory.findby
    logger.info(`Starting guide registration for user: ${userId}`);
    const existing = await this.guideRepository.findOne({ userId });
    if (existing) {
      logger.warn(`Registration failed: User ${userId} already has an application`);
      throw new Error('Application already exists');
    }
    const user = await this.userRepository.findById(userId);
    if (!user) {
      logger.error(`User not found during guide registration: ${userId}`);
      console.log('from guide register ', user);
    }
    const profileData: CreateGuideDTO = {
      userId,
      name: user?.name ? user.name : '',
      bio: data.bio,
      hourlyRate: Number(data.hourlyRate),
      serviceArea: data.serviceArea,
      yearsOfExperience: Number(data.yearsOfExperience) || 0,
      specialties: data.specialties,
      avatarURL: fileName ? `/uploads/guides/${fileName}` : '',
      isVerified: false,
    };

    logger.info(`Creating guide profile for ${user?.name}`, { yearsOfExperience: profileData.yearsOfExperience });

    return await this.guideRepository.create(profileData);
  }


  async getStatus(userId: string) {
    const profile = await this.guideRepository.findOne({ userId });
    if (!profile) return { exists: false };

    return {
      exists: true,
      isVerified: profile.isVerified
    };
  }


  async getAllVerifiedGuides(query: GuideQueryDTO): Promise<GuideResponseDTO[]> {
    const filters: Record<string, unknown> = { isVerified: true };

    if (query.destination) {
      filters.serviceArea = { $regex: query.destination, $options: 'i' };
    }

    if (query.maxPrice) {
      filters.hourlyRate = { $lte: Number(query.maxPrice) };
    }

    const guides = await this.guideRepository.findAll(filters);
    return guides.map(toGuideResponse);
  }
}