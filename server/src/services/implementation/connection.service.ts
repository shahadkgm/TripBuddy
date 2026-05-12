import { IConnectionRepository } from '../../repositories/interface/IConnectionRepository';
import { ITripRepository } from '../../repositories/interface/ITripRepository';
import { IConnectionService } from '../interface/IConnectionService';
import { IConnectionDocument } from '../../types/connection.type';
import { IUser } from '../../types/user.type';
import { logger } from '@/utils/logger';
import { getIO } from '../../config/socket';

export class ConnectionService implements IConnectionService {
  constructor(
    private _connectionRepository: IConnectionRepository,
    private _tripRepository: ITripRepository
  ) { }

  async sendRequest(
    senderId: string,
    receiverId: string,
    tripId?: string
  ): Promise<IConnectionDocument> {
    logger.info(
      `Sending connection request from ${senderId} to ${receiverId} for trip ${tripId || 'general'}`
    );
    // Check if request already exists
    const existing = await this._connectionRepository.findByUsers(senderId, receiverId, tripId);
    if (existing) {
      if (existing.status === 'rejected') {
        logger.info('Connection request was previously rejected. Retrying...');
        const updatedRequest = await this._connectionRepository.updateById(
          existing._id.toString(), 
          { status: 'pending' }
        );
        
        if (updatedRequest) {
          try {
            getIO().to(`user_${receiverId}`).emit('global_notification', {
              title: tripId ? 'New Trip Invitation' : 'New Connection Request',
              message: tripId ? 'Someone invited you to join a trip!' : 'Someone wants to connect with you.',
              link: '/connection-requests'
            });
          } catch (e) {
            logger.error('Failed to emit connection request notification', { error: e });
          }
          return updatedRequest;
        }
      }
      logger.info('Connection request already exists');
      return existing;
    }

    const newRequest = await this._connectionRepository.create({
      senderId,
      receiverId,
      tripId,
      status: 'pending',
    });

    try {
      getIO().to(`user_${receiverId}`).emit('global_notification', {
        title: tripId ? 'New Trip Invitation' : 'New Connection Request',
        message: tripId ? 'Someone invited you to join a trip!' : 'Someone wants to connect with you.',
        link: '/connection-requests'
      });
    } catch (e) {
      logger.error('Failed to emit connection request notification', { error: e });
    }

    return newRequest;
  }

  async acceptRequest(requestId: string): Promise<IConnectionDocument | null> {
    logger.info(`Accepting connection request: ${requestId}`);
    const connection = await this._connectionRepository.findById(requestId);
    if (connection && connection.tripId) {
      // Add sender to trip members
      await this._tripRepository.addMember(
        connection.tripId.toString(),
        connection.senderId.toString()
      );
    }
    const updated = await this._connectionRepository.updateById(requestId, { status: 'accepted' });

    if (updated) {
      try {
        const senderIdStr = updated.senderId.toString();
        getIO().to(`user_${senderIdStr}`).emit('global_notification', {
          title: 'Request Accepted',
          message: updated.tripId 
            ? 'Your trip invitation was accepted!' 
            : 'Your connection request was accepted!',
          link: '/connection-requests'
        });
      } catch (e) {
        logger.error('Failed to emit request accepted notification', { error: e });
      }
    }

    return updated;
  }

  async rejectRequest(requestId: string): Promise<IConnectionDocument | null> {
    logger.info(`Rejecting connection request: ${requestId}`);
    return await this._connectionRepository.updateById(requestId, { status: 'rejected' });
  }

  async getPendingRequests(userId: string): Promise<IConnectionDocument[]> {
    logger.info(`Fetching pending requests for user: ${userId}`);
    return await this._connectionRepository.getPendingRequests(userId);
  }

  async getSentRequests(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<{ requests: IConnectionDocument[]; total: number }> {
    logger.info(`Fetching sent requests for user: ${userId}`);
    return await this._connectionRepository.getSentRequests(userId, page, limit);
  }

  async getConnectionStatus(
    senderId: string,
    receiverId: string,
    tripId?: string
  ): Promise<string> {
    logger.debug(`Checking connection status between ${senderId} and ${receiverId}`);
    const connection = await this._connectionRepository.findByUsers(senderId, receiverId, tripId);
    if (connection) return connection.status;

    // Also check if the receiver sent a request to the sender
    const reverseConnection = await this._connectionRepository.findByUsers(
      receiverId,
      senderId,
      tripId
    );
    if (reverseConnection)
      return reverseConnection.status === 'accepted' ? 'accepted' : 'incoming_pending';

    return 'none';
  }

  async getTripMembers(tripId: string): Promise<IUser[]> {
    logger.info(`Fetching trip members for trip: ${tripId}`);
    const trip = await this._tripRepository.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    const connections = await this._connectionRepository.getTripConnections(tripId);

    const membersSet = new Map<string, IUser>();

    // Add creator
    const owner = trip.userId as unknown as IUser;
    if (owner && owner._id) membersSet.set(owner._id.toString(), owner);

    connections.forEach(conn => {
      const sender = conn.senderId as unknown as IUser;
      const receiver = conn.receiverId as unknown as IUser;
      if (sender && sender._id) membersSet.set(sender._id.toString(), sender);
      if (receiver && receiver._id) membersSet.set(receiver._id.toString(), receiver);
    });

    return Array.from(membersSet.values());
  }
}
