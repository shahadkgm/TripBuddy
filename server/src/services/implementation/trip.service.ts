import { ITripDocument, ITripFilters } from '../../types/trip.type';
import { CreateTripDTO } from '../../dto/trip.dto';
import { ITripRepository } from '../../repositories/interface/ITripRepository';
import { ITripService } from '../interface/ITripService';
import { logger } from '@/utils/logger';

export class TripService implements ITripService {

    private _tripRepository: ITripRepository;

    constructor(tripRepository: ITripRepository) {
        this._tripRepository = tripRepository;
    }

    async createTrip(data: CreateTripDTO): Promise<ITripDocument> {
        logger.info('Creating new trip in service in t-s', { data });
        return await this._tripRepository.create(data);
    }

    async getUserTrips(userId: string): Promise<ITripDocument[]> {
        return await this._tripRepository.findByUserId(userId);
    }

    async getTripById(tripId: string): Promise<ITripDocument | null> {
        return await this._tripRepository.findById(tripId);
    }

    async getAllTrips(filters: ITripFilters, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }> {
        logger.info('Fetching all trips with filters in t-s', { filters, page, limit });
        return await this._tripRepository.findAllTrips(filters, page, limit);
    }

    async updateTrip(id: string, data: Partial<CreateTripDTO>): Promise<ITripDocument | null> {
        logger.info('Updating trip in service', { id, data });
        return await this._tripRepository.updateById(id, data);
    }
}
