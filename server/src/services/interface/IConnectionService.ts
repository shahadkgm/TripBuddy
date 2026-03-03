import { IConnectionDocument } from '../../types/connection.type';
import { IUser } from '../../types/user.type';

export interface IConnectionService {
    sendRequest(senderId: string, receiverId: string, tripId?: string): Promise<IConnectionDocument>;
    acceptRequest(requestId: string): Promise<IConnectionDocument | null>;
    rejectRequest(requestId: string): Promise<IConnectionDocument | null>;
    getPendingRequests(userId: string): Promise<IConnectionDocument[]>;
    getConnectionStatus(senderId: string, receiverId: string, tripId?: string): Promise<string>;
    getTripMembers(tripId: string): Promise<IUser[]>;
}
