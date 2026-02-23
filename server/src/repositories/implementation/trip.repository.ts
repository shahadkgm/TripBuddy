import { Model } from 'mongoose';
import { ITripDocument, ITripFilters } from '../../types/trip.type';
import { TripModel } from '../../models/trip.model';
import { CreateTripDTO } from '../../dto/trip.dto';
import { BaseRepository } from './base.repository';
import { ITripRepository } from '../interface/ITripRepository';
import { FilterQuery } from 'mongoose';
import { logger } from '@/utils/logger';

export class TripRepository extends BaseRepository<ITripDocument, CreateTripDTO> implements ITripRepository {
    constructor() {
        super(TripModel);
    }

    async findByUserId(userId: string): Promise<ITripDocument[]> {
        return await this._model.find({ userId: userId }).sort({ createdAt: -1 });
    }

    async findAllTrips(filters: ITripFilters, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }> {
        const query: FilterQuery<ITripDocument> = {};
        logger.info(`Reaching findAllTrips in repository, searching for in t-c: ${filters.destination || 'any destination'}`);
        if (filters.destination) {
            query.destination = { $regex: filters.destination, $options: 'i' };
        }

        if (filters.transport) {
            query['preferences.transport'] = filters.transport;
        }

        if (filters.interest) {
            query['preferences.interests'] = filters.interest;
        }

        const skip = (page - 1) * limit;

        const [trips, total] = await Promise.all([
            this._model.find(query)
                .populate('userId', 'name email avatarURL role') // Populate user details
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            this._model.countDocuments(query)
        ]);

        // Filter out trips where the user no longer exists (populated as null)
        const validTrips = trips.filter(trip => trip.userId !== null);

        return { trips: validTrips, total };
    }
}
