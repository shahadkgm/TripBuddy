import { FilterQuery } from 'mongoose';
import GuideProfile from '../../models/guide.model.js';
import { Guide, GuideCreate } from '../../types/guide.type.js';
import { IGuideRepository } from '../interface/IGuideRepository.js';
import { BaseRepository } from './base.repository.js';

export class GuideRepository extends BaseRepository<Guide> implements IGuideRepository {

  constructor() {
    super(GuideProfile);
  }

  async findAll(filters: Record<string, unknown> = {}): Promise<Guide[]> {
    return await this.model
      .find(filters as FilterQuery<Guide>)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUserId(userId: string): Promise<Guide | null> {
    return await this.findOne({ userId });
  }

  async create(data: GuideCreate): Promise<Guide> {
    return await this.model.create(data);
  }


}
