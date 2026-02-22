import { ITrip, ITripDocument } from '../../types/trip.type';
import { IBaseRepository } from './IBaseRepository';
import { CreateTripDTO } from '../../dto/trip.dto';

export interface ITripRepository extends IBaseRepository<ITripDocument, CreateTripDTO> {
    findByUserId(userId: string): Promise<ITripDocument[]>;
}
