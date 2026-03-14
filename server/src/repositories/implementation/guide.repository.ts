import { FilterQuery } from 'mongoose';
import { CreateGuideDTO } from '../../dto/guide.dto';
import guideModel from '../../models/guide.model';
import { BaseRepository } from './base.repository';
import { IGuideRepository } from '../interface/IGuideRepository';
import { IGuide } from '../../types/guide.type';

export class GuideRepository extends BaseRepository<IGuide, CreateGuideDTO> implements IGuideRepository {

  constructor() {
    super(guideModel);
  }

  async findAllWithPagination(filters: Record<string, unknown> = {}, page: number = 1, limit: number = 10): Promise<{ guides: IGuide[], total: number }> {
    const skip = (page - 1) * limit;
    const query = filters as FilterQuery<IGuide>;
    
    const [guides, total] = await Promise.all([
      this._model
        .find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this._model.countDocuments(query)
    ]);

    return { guides, total };
  }

}
