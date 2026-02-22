import { Model } from 'mongoose';
import { ITripDocument } from '../../types/trip.type';
import { TripModel } from '../../models/trip.model';
import { CreateTripDTO } from '../../dto/trip.dto';
import { BaseRepository } from './base.repository';
import { ITripRepository } from '../interface/ITripRepository';

export class TripRepository extends BaseRepository<ITripDocument, CreateTripDTO> implements ITripRepository {
    constructor() {
        super(TripModel);
    }

    async findByUserId(userId: string): Promise<ITripDocument[]> {
        return await this._model.find({ userId: userId }).sort({ createdAt: -1 });
    }
}
