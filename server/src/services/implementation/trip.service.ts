import { ITripDocument } from '../../types/trip.type';
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
        logger.info(`reached in create Trip${data}`)
        return await this._tripRepository.create(data);
    }

    async getUserTrips(userId: string): Promise<ITripDocument[]> {
        return await this._tripRepository.findByUserId(userId);
    }

    async getTripById(tripId: string): Promise<ITripDocument | null> {
        return await this._tripRepository.findById(tripId);
    }
}
