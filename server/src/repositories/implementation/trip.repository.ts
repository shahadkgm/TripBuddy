import { ITripDocument, ITripFilters } from '../../types/trip.type';
import { TripModel } from '../../models/trip.model';
import { IMessagePopulated } from '../../models/message.model';
import { CreateTripDTO } from '../../dto/trip.dto';
import { BaseRepository } from './base.repository';
import { ITripRepository } from '../interface/ITripRepository';
import mongoose, { FilterQuery } from 'mongoose';
import { logger } from '@/utils/logger';

interface IAggregationResult {
    metadata: { total: number }[];
    data: ITripDocument[];
}

export class TripRepository extends BaseRepository<ITripDocument, CreateTripDTO> implements ITripRepository {
    constructor() {
        super(TripModel);
    }

    async findByUserId(userId: string): Promise<ITripDocument[]> {
        return await this._model.find({
            $or: [
                { userId: userId },
                { members: userId }
            ]
        })
            .populate('userId', 'name email avatarURL')
            .populate('members', 'name email avatarURL')
            .sort({ createdAt: -1 });
    }

    override async findById(id: string | mongoose.Types.ObjectId): Promise<ITripDocument | null> {
        return await this._model.findById(id)
            .populate('userId', 'name email avatarURL')
            .populate('members', 'name email avatarURL')
            .exec();
    }

    async findAllTrips(filters: ITripFilters, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }> {
        const skip = (page - 1) * limit;
        const query: FilterQuery<ITripDocument> = {
            status: 'planned' // Only show planned trips for joining
        };
        
        if (filters.destination) query.destination = { $regex: filters.destination, $options: 'i' };
        if (filters.transport && filters.transport !== 'Any') query['preferences.transport'] = filters.transport;
        if (filters.interest && filters.interest !== 'Any') query['preferences.interests'] = filters.interest;

        logger.info('Executing findAllTrips query', { query });

        const aggregationResult = await this._model.aggregate<IAggregationResult>([
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

        const result = aggregationResult[0];

        return {
            trips: result?.data || [],
            total: result?.metadata[0]?.total || 0
        };
    }

    async addMember(tripId: string, userId: string): Promise<ITripDocument | null> {
        return await this._model.findByIdAndUpdate(
            tripId,
            { $addToSet: { members: userId } },
            { new: true }
        );
    }

    async getChatHistory(tripId: string): Promise<IMessagePopulated[]> {
        return await mongoose.model('Message').find({ tripId })
            .populate('senderId', 'name avatarURL')
            .sort({ createdAt: 1 })
            .lean() as unknown as IMessagePopulated[];
    }
}
