import { IGuideRepository } from '../interface/IGuideRepository.js';
import GuideProfile from '../../models/guide.model.js';
import { Guide } from '../../types/guide.type.js';
import { BaseRepository } from './base.repository.js';

export class GuideRepository
  extends BaseRepository<Guide>
  implements IGuideRepository {

  constructor() {
    super(GuideProfile);
  }

  async findAll(filters: Record<string, unknown>): Promise<Guide[]> {
    const docs = await this.model
      .find(filters)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return this.mapMany(docs);
  }

  async findByUserId(userId: string): Promise<Guide | null> {
    return this.findOne({ userId });
  }
}
