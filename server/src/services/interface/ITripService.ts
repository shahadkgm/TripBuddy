import { ITripDocument, ITripFilters } from '../../types/trip.type';
import { CreateTripDTO } from '../../dto/trip.dto';
import { IMessagePopulated } from '../../models/message.model';

export interface ITripService {
    createTrip(data: CreateTripDTO): Promise<ITripDocument>;
    getUserTrips(userId: string, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }>;
    getTripById(tripId: string): Promise<ITripDocument | null>;
    getAllTrips(filters: ITripFilters, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }>;
    updateTrip(id: string, data: Partial<CreateTripDTO>): Promise<ITripDocument | null>;
    getChatHistory(tripId: string, page: number, limit: number): Promise<{ messages: IMessagePopulated[], total: number }>;
    
    // Lifecycle Management
    finalizeTrip(tripId: string, userId: string, budget: number, depositAmount: number): Promise<ITripDocument>;
    checkAndConfirmTrip(tripId: string): Promise<ITripDocument | null>;
    leaveTrip(tripId: string, userId: string): Promise<ITripDocument>;
    cancelTrip(tripId: string, userId: string): Promise<ITripDocument>;
    completeTrip(tripId: string, userId: string): Promise<ITripDocument>;
    assignGuide(tripId: string, guideId: string | null, userId: string): Promise<ITripDocument>;
    getGuideTrips(guideId: string, page: number, limit: number): Promise<{ trips: ITripDocument[], total: number }>;
}
