import { ITripDocument, ITripFilters } from '../../types/trip.type';
import { CreateTripDTO } from '../../dto/trip.dto';

export interface ITripService {
    createTrip(data: CreateTripDTO): Promise<ITripDocument>;
    getUserTrips(userId: string): Promise<ITripDocument[]>;
    getTripById(tripId: string): Promise<ITripDocument | null>;
    getAllTrips(filters: ITripFilters, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }>;
}
