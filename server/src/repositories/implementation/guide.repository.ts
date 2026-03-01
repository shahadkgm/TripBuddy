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

  async findAll(filters: Record<string, unknown> = {}): Promise<IGuide[]> {
    return await this._model
      .find(filters as FilterQuery<IGuide>)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

}
