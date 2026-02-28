import { IConnectionDocument } from '../../../types/connection.type';
import { IBaseRepository } from './IBaseRepository';
import { CreateConnectionDTO } from '../../../dto/connection.dto';

export interface IConnectionRepository extends IBaseRepository<IConnectionDocument, CreateConnectionDTO> {
    findByUsers(senderId: string, receiverId: string, tripId?: string): Promise<IConnectionDocument | null>;
    getUserConnections(userId: string): Promise<IConnectionDocument[]>;
    getPendingRequests(userId: string): Promise<IConnectionDocument[]>;
}
