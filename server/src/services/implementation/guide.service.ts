import {
  CreateGuideDTO,
  GuideQueryDTO,
  GuideRegisterDTO,
  GuideResponseDTO,
  GuideUpdateDTO,
} from '../../dto/guide.dto';
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
  ) {}

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
      dailyRate: Number(data.dailyRate),
      serviceArea: data.serviceArea,
      yearsOfExperience: Number(data.yearsOfExperience) || 0,
      specialties: data.specialties,
      avatarURL: avatarURL || '',
      isVerified: false,
    };

    logger.info(`Creating guide profile for ${user?.name}`, {
      yearsOfExperience: profileData.yearsOfExperience,
    });

    return await this._guideRepository.create(profileData);
  }

  async getStatus(userId: string) {
    logger.info(`Checking guide status for user: ${userId}`);
    const profile = await this._guideRepository.findOne({ userId });
    if (!profile) return { exists: false };

    return {
      exists: true,
      isVerified: profile.isVerified,
      status: profile.status,
      rejectionReason: profile.rejectionReason,
    };
  }

  async getAllVerifiedGuides(
    query: GuideQueryDTO
  ): Promise<{ guides: GuideResponseDTO[]; total: number }> {
    logger.info(`Fetching all verified guides with filters: ${JSON.stringify(query)}`);
    const filters: Record<string, unknown> = { isVerified: true };

    if (query.destination) {
      filters.serviceArea = { $regex: query.destination, $options: 'i' };
    }

    if (query.maxPrice) {
      filters.dailyRate = { $lte: Number(query.maxPrice) };
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const { guides, total } = await this._guideRepository.findAllWithPagination(
      filters,
      page,
      limit
    );
    logger.info(`Found ${guides.length} verified guides out of ${total}`);

    return {
      guides: guides.map(toGuideResponse),
      total,
    };
  }

  async updateProfile(userId: string, data: GuideUpdateDTO): Promise<IGuide | null> {
    logger.info(`Updating guide profile for user: ${userId}`, { data });
    const guide = await this._guideRepository.findOne({ userId });
    if (!guide) {
      throw new Error('Guide profile not found');
    }

    const updated = await this._guideRepository.updateById(guide._id.toString(), {
      ...data,
      lastUpdated: new Date(),
    });

    if (updated && data.avatarURL) {
      // Also update user avatar if guide avatar is updated
      await this._userRepository.updateById(userId, { avatarURL: data.avatarURL });
    }

    return updated;
  }

  async resetStatus(userId: string): Promise<boolean> {
    logger.info(`Resetting guide application for user: ${userId}`);
    return await this._guideRepository.deleteByUserId(userId);
  }
}
