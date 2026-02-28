import { IConnectionRepository } from '../../domain/repositories/interface/IConnectionRepository';
import { IConnectionService } from '../interface/IConnectionService';
import { IConnectionDocument } from '../../types/connection.type';
import { logger } from '@/utils/logger';

export class ConnectionService implements IConnectionService {
    constructor(private _connectionRepository: IConnectionRepository) { }

    async sendRequest(senderId: string, receiverId: string, tripId?: string): Promise<IConnectionDocument> {
        logger.info(`Sending connection request from ${senderId} to ${receiverId} for trip ${tripId || 'general'}`);
        // Check if request already exists
        const existing = await this._connectionRepository.findByUsers(senderId, receiverId, tripId);
        if (existing) {
            logger.info('Connection request already exists');
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
        logger.info(`Accepting connection request: ${requestId}`);
        return await this._connectionRepository.updateById(requestId, { status: 'accepted' });
    }

    async rejectRequest(requestId: string): Promise<IConnectionDocument | null> {
        logger.info(`Rejecting connection request: ${requestId}`);
        return await this._connectionRepository.updateById(requestId, { status: 'rejected' });
    }

    async getPendingRequests(userId: string): Promise<IConnectionDocument[]> {
        logger.info(`Fetching pending requests for user: ${userId}`);
        return await this._connectionRepository.getPendingRequests(userId);
    }

    async getConnectionStatus(senderId: string, receiverId: string, tripId?: string): Promise<string> {
        logger.debug(`Checking connection status between ${senderId} and ${receiverId}`);
        const connection = await this._connectionRepository.findByUsers(senderId, receiverId, tripId);
        if (connection) return connection.status;

        // Also check if the receiver sent a request to the sender
        const reverseConnection = await this._connectionRepository.findByUsers(receiverId, senderId, tripId);
        if (reverseConnection) return reverseConnection.status === 'accepted' ? 'accepted' : 'incoming_pending';

        return 'none';
    }
}
