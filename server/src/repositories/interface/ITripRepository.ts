import { ITripDocument, ITripFilters } from '../../types/trip.type';
import { IBaseRepository } from './IBaseRepository';
import { CreateTripDTO } from '../../dto/trip.dto';
import { IMessagePopulated } from '../../models/message.model';

export interface ITripRepository extends IBaseRepository<ITripDocument, CreateTripDTO> {
  findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ trips: ITripDocument[]; total: number }>;
  findAllTrips(
    filters: ITripFilters,
    page: number,
    limit: number
  ): Promise<{ trips: ITripDocument[]; total: number }>;
  addMember(tripId: string, userId: string): Promise<ITripDocument | null>;
  getChatHistory(
    tripId: string,
    page: number,
    limit: number
  ): Promise<{ messages: IMessagePopulated[]; total: number }>;
  assignGuide(tripId: string, guideId: string | null): Promise<ITripDocument | null>;
  findByGuideId(
    guideId: string,
    page: number,
    limit: number
  ): Promise<{ trips: ITripDocument[]; total: number }>;
}
