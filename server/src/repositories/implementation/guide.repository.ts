import mongoose, { FilterQuery, PipelineStage } from 'mongoose';
import { CreateGuideDTO } from '../../dto/guide.dto';
import guideModel from '../../models/guide.model';
import { BaseRepository } from './base.repository';
import { IGuideRepository } from '../interface/IGuideRepository';
import { IGuide } from '../../types/guide.type';

export class GuideRepository
  extends BaseRepository<IGuide, CreateGuideDTO>
  implements IGuideRepository {
  constructor() {
    super(guideModel);
  }

  async findAllWithPagination(
    filters: Record<string, unknown> = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ guides: IGuide[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = filters as FilterQuery<IGuide>;

    const pipeline: PipelineStage[] = [
      { $match: query },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'guideId',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          averageRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] },
          reviewCount: { $size: '$reviews' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' },
      {
        $project: {
          reviews: 0,
          'userId.password': 0,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const [guides, totalResults] = await Promise.all([
      this._model.aggregate<IGuide>(pipeline).exec(),
       this._model.countDocuments(query),
    ]);

    return { guides, total: totalResults };
  }
  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this._model.deleteOne({ userId });
    return result.deletedCount > 0;
  }

  async updateStats(guideId: string): Promise<void> {
    const stats = await mongoose.model('Review').aggregate([
      { $match: { guideId: new mongoose.Types.ObjectId(guideId) } },
      {
        $group: {
          _id: '$guideId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await this._model.findByIdAndUpdate(guideId, {
        averageRating: stats[0].averageRating,
        reviewCount: stats[0].reviewCount,
      });
    }
  }
}
