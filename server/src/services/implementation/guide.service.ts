import { GuideQueryDTO, GuideRegisterDTO, GuideResponseDTO } from '../../dto/guide.dto.js';
import { IGuideRepository } from '../../repositories/interface/IGuideRepository.js';
import { IUserRepository } from '../../repositories/interface/IUserRepository.js';
import { toGuideResponse } from '../../utils/guide.mapper.js';
import { logger } from '../../utils/logger.js';
import { IGuideService } from '../interface/IGuideService.js';


export class GuideService implements IGuideService {

  constructor(private guideRepository: IGuideRepository, private userRepository: IUserRepository) { }


  async register(userId: string, data: GuideRegisterDTO, fileName?: string): Promise<any> {
    // const user=await this.userRepsitory.findby
    logger.info(`Starting guide registration for user: ${userId}`);
    const existing = await this.guideRepository.findByUserId(userId);
    if (existing) {
      logger.warn(`Registration failed: User ${userId} already has an application`);
      throw new Error('Application already exists');
    }
    const user = await this.userRepository.findById(userId);
    if (!user) {
      logger.error(`User not found during guide registration: ${userId}`);
      console.log('from guide register ', user);
    }
    const profileData: any = { // use dto for creating guide
      userId,
      name: user?.name ? user.name : '',
      bio: data.bio,
      hourlyRate: Number(data.hourlyRate),
      serviceArea: data.serviceArea,
      yearsOfExperience: Number(data.yearsOfExperience) || 0,
      specialties:
        typeof data.specialties === 'string'
          ? JSON.parse(data.specialties)
          : data.specialties,
      avatarURL: fileName ? `/uploads/guides/${fileName}` : '',
      isVerified: false,

    };
    logger.info(`Creating guide profile for ${user?.name}`, { yearsOfExperience: profileData.yearsOfExperience });

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