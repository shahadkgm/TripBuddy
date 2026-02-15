import { FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository.js';
import guideModel from '../../models/guide.model.js';
import { IGuide } from '../../types/guide.type.js';
import { IGuideRepository } from '../interface/IGuideRepository.js';

export class GuideRepository extends BaseRepository<IGuide> implements IGuideRepository {

  constructor() {
    super(guideModel)
  }

  async findAll(filters: Record<string, unknown> = {}): Promise<IGuide[]> {
    return await this.model
      .find(filters as FilterQuery<IGuide>)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUserId(userId: string): Promise<IGuide | null> {
    return await this.findOne({ userId });
  }

  async create(data: any): Promise<IGuide> { // use dto for creating guide
    return await this.model.create(data);
  }


}
