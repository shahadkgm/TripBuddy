import { CreateGuideDTO, GuideQueryDTO, GuideRegisterDTO, GuideResponseDTO } from '../../dto/guide.dto';
import { IGuide } from '../../types/guide.type';
import { IGuideRepository } from '../../repositories/interface/IGuideRepository';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { toGuideResponse } from '../../utils/guide.mapper';
import { logger } from '../../utils/logger';
import { IGuideService } from '../interface/IGuideService';


export class GuideService implements IGuideService {

  constructor(
    private readonly _guideRepository: IGuideRepository,
    private readonly _userRepository: IUserRepository
  ) { }


  async register(userId: string, data: GuideRegisterDTO, avatarURL?: string): Promise<IGuide> {
    // const user=await this._userRepsitory.findby
    logger.info(`Starting guide registration for user: ${userId}`);
    const existing = await this._guideRepository.findOne({ userId });
    if (existing) {
      logger.warn(`Registration failed: User ${userId} already has an application`);
      throw new Error('Application already exists');
    }
    const user = await this._userRepository.findById(userId);
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
      avatarURL: avatarURL || '',
      isVerified: false,
    };

    logger.info(`Creating guide profile for ${user?.name}`, { yearsOfExperience: profileData.yearsOfExperience });

    return await this._guideRepository.create(profileData);
  }


  async getStatus(userId: string) {
    logger.info(`Checking guide status for user: ${userId}`);
    const profile = await this._guideRepository.findOne({ userId });
    if (!profile) return { exists: false };

    return {
      exists: true,
      isVerified: profile.isVerified
    };
  }


  async getAllVerifiedGuides(query: GuideQueryDTO): Promise<{ guides: GuideResponseDTO[], total: number }> {
    logger.info(`Fetching all verified guides with filters: ${JSON.stringify(query)}`);
    const filters: Record<string, unknown> = { isVerified: true };

    if (query.destination) {
      filters.serviceArea = { $regex: query.destination, $options: 'i' };
    }

    if (query.maxPrice) {
      filters.hourlyRate = { $lte: Number(query.maxPrice) };
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const { guides, total } = await this._guideRepository.findAllWithPagination(filters, page, limit);
    logger.info(`Found ${guides.length} verified guides out of ${total}`);
    
    return {
      guides: guides.map(toGuideResponse),
      total
    };
  }
}