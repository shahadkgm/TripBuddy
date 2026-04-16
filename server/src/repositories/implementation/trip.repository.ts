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

    async findByUserId(userId: string, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }> {
        const skip = (page - 1) * limit;
        const query = {
            $or: [
                { userId: userId },
                { members: userId }
            ]
        };

        const [trips, total] = await Promise.all([
            this._model.find(query)
                .populate('userId', 'name email avatarURL')
                .populate('members', 'name email avatarURL')
                .populate({
                    path: 'guideId',
                    populate: {
                        path: 'userId',
                        select: 'name email avatarURL'
                    }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this._model.countDocuments(query)
        ]);

        return { trips, total };
    }

    override async findById(id: string | mongoose.Types.ObjectId): Promise<ITripDocument | null> {
        return await this._model.findById(id)
            .populate('userId', 'name email avatarURL')
            .populate('members', 'name email avatarURL')
            .populate({
                path: 'guideId',
                populate: {
                    path: 'userId',
                    select: 'name email avatarURL'
                }
            })
            .exec();
    }

    async findAllTrips(filters: ITripFilters, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }> {
        const skip = (page - 1) * limit;
        const query: FilterQuery<ITripDocument> = {
            status: { $in: ['planned', 'finalized'] }, 
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

    async getChatHistory(tripId: string, page: number, limit: number): Promise<{ messages: IMessagePopulated[], total: number }> {
        const skip = (page - 1) * limit;
        const query = { tripId };

        const [messages, total] = await Promise.all([
            mongoose.model('Message').find(query)
                .populate('senderId', 'name avatarURL')
                .sort({ createdAt: -1 }) // Usually chat pagination loads newest first (reversed)
                .skip(skip)
                .limit(limit)
                .lean() as unknown as IMessagePopulated[],
            mongoose.model('Message').countDocuments(query)
        ]);

        // Return messages in correct order (oldest to newest for the segment)
        return { 
            messages: messages.reverse(), 
            total 
        };
    }

    async assignGuide(tripId: string, guideId: string | null): Promise<ITripDocument | null> {
        const update = guideId
            ? { $set: { guideId } }
            : { $unset: { guideId: '' } };
        return await this._model.findByIdAndUpdate(tripId, update, { new: true })
            .populate('guideId', 'name bio hourlyRate serviceArea avatarURL specialties isVerified userId');
    }

    async findByGuideId(guideId: string, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }> {
        const skip = (page - 1) * limit;
        const query = { guideId };

        const [trips, total] = await Promise.all([
            this._model.find(query)
                .populate('userId', 'name email avatarURL')
                .populate('members', 'name email avatarURL')
                .sort({ startDate: 1 })
                .skip(skip)
                .limit(limit),
            this._model.countDocuments(query)
        ]);

        return { trips, total };
    }
}
