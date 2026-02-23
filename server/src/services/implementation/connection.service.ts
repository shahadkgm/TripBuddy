import { IConnectionRepository } from '../../repositories/interface/IConnectionRepository';
import { IConnectionService } from '../interface/IConnectionService';
import { IConnectionDocument } from '../../types/connection.type';

export class ConnectionService implements IConnectionService {
    constructor(private _connectionRepository: IConnectionRepository) { }

    async sendRequest(senderId: string, receiverId: string, tripId?: string): Promise<IConnectionDocument> {
        // Check if request already exists
        const existing = await this._connectionRepository.findByUsers(senderId, receiverId, tripId);
        if (existing) {
            return existing;
        }

        return await this._connectionRepository.create({
            senderId,
            receiverId,
            tripId,
            status: 'pending'
        });
    }

    async acceptRequest(requestId: string): Promise<IConnectionDocument | null> {
        return await this._connectionRepository.updateById(requestId, { status: 'accepted' });
    }

    async rejectRequest(requestId: string): Promise<IConnectionDocument | null> {
        return await this._connectionRepository.updateById(requestId, { status: 'rejected' });
    }

    async getPendingRequests(userId: string): Promise<IConnectionDocument[]> {
        return await this._connectionRepository.getPendingRequests(userId);
    }

    async getConnectionStatus(senderId: string, receiverId: string, tripId?: string): Promise<string> {
        const connection = await this._connectionRepository.findByUsers(senderId, receiverId, tripId);
        if (connection) return connection.status;

        // Also check if the receiver sent a request to the sender
        const reverseConnection = await this._connectionRepository.findByUsers(receiverId, senderId, tripId);
        if (reverseConnection) return reverseConnection.status === 'accepted' ? 'accepted' : 'incoming_pending';

        return 'none';
    }
}
