import { ITripDocument, ITripFilters } from '../../types/trip.type';
import { TripModel } from '../../models/trip.model';
import { CreateTripDTO } from '../../dto/trip.dto';
import { BaseRepository } from './base.repository';
import { ITripRepository } from '../interface/ITripRepository';
import mongoose, { FilterQuery } from 'mongoose';
import { logger } from '@/utils/logger';

export class TripRepository extends BaseRepository<ITripDocument, CreateTripDTO> implements ITripRepository {
    constructor() {
        super(TripModel);
    }

    async findByUserId(userId: string): Promise<ITripDocument[]> {
        return await this._model.find({ userId: userId }).sort({ createdAt: -1 });
    }

    override async findById(id: string | mongoose.Types.ObjectId): Promise<ITripDocument | null> {
        return await this._model.findById(id).populate('userId', 'name email avatarURL').exec();
    }

    async findAllTrips(filters: ITripFilters, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }> {
        const skip = (page - 1) * limit;
        const query: FilterQuery<ITripDocument> = {};
        logger.info(`from findAllTrips${query}`);
        if (filters.destination) query.destination = { $regex: filters.destination, $options: 'i' };
        if (filters.transport) query['preferences.transport'] = filters.transport;
        if (filters.interest) query['preferences.interests'] = filters.interest;

        const [result] = await this._model.aggregate([
            { $match: query },
            { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'userDetails' } },
            { $unwind: '$userDetails' },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        { $addFields: { userId: '$userDetails' } },
                        { $project: { userDetails: 0, 'userId.password': 0 } }
                    ]
                }
            }
        ]);

        return {
            trips: result.data,
            total: result.metadata[0]?.total || 0
        };
    }
}
