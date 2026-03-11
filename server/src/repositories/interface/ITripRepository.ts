import { ITripDocument, ITripFilters } from '../../types/trip.type';
import { IBaseRepository } from './IBaseRepository';
import { CreateTripDTO } from '../../dto/trip.dto';
import { IMessagePopulated } from '../../models/message.model';

export interface ITripRepository extends IBaseRepository<ITripDocument, CreateTripDTO> {
    findByUserId(userId: string): Promise<ITripDocument[]>;
    findAllTrips(filters: ITripFilters, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }>;
    addMember(tripId: string, userId: string): Promise<ITripDocument | null>;
    getChatHistory(tripId: string): Promise<IMessagePopulated[]>;
}
