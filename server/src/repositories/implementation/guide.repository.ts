import { FilterQuery } from 'mongoose';
import GuideProfile, { IGuideDocument } from '../../models/guide.model.js';
import { Guide, GuideCreate } from '../../types/guide.type.js';
import { IGuideRepository } from '../interface/IGuideRepository.js';

export class GuideRepository implements IGuideRepository {

  async findAll(filters: Record<string, unknown> = {}): Promise<Guide[]> {
    const docs = await GuideProfile
      .find(filters as FilterQuery<IGuideDocument>)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    return docs.map(this.toDomain);
  }

  async findByUserId(userId: string): Promise<Guide | null> {
    const doc = await GuideProfile.findOne({ userId }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async create(data: GuideCreate): Promise<Guide> {
    const doc = await GuideProfile.create(data);
    return this.toDomain(doc);
  }

  private toDomain(doc: IGuideDocument): Guide {
    return {
      ...doc.toObject(),
      _id: doc._id.toString(),
    } as Guide;
  }
}
