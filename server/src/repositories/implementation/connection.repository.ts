import { ConnectionModel } from '../../models/connection.model';
import { IConnectionDocument } from '../../types/connection.type';
import { BaseRepository } from './base.repository';
import { IConnectionRepository } from '../interface/IConnectionRepository';
import { CreateConnectionDTO } from '../../dto/connection.dto';
import { FilterQuery } from 'mongoose';

export class ConnectionRepository
  extends BaseRepository<IConnectionDocument, CreateConnectionDTO>
  implements IConnectionRepository
{
  constructor() {
    super(ConnectionModel);
  }

  async findByUsers(
    senderId: string,
    receiverId: string,
    tripId?: string
  ): Promise<IConnectionDocument | null> {
    const query: FilterQuery<IConnectionDocument> = { senderId, receiverId };
    if (tripId) query.tripId = tripId;
    return await this._model.findOne(query);
  }

  async getUserConnections(userId: string): Promise<IConnectionDocument[]> {
    return await this._model
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
        status: 'accepted',
      })
      .populate('senderId receiverId', 'name email avatarURL');
  }

  async getPendingRequests(userId: string): Promise<IConnectionDocument[]> {
    return await this._model
      .find({
        receiverId: userId,
        status: 'pending',
      })
      .populate('senderId', 'name email avatarURL')
      .populate('tripId', 'title destination');
  }

  async getSentRequests(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ requests: IConnectionDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = { senderId: userId };

    const [requests, total] = await Promise.all([
      this._model
        .find(query)
        .populate('receiverId', 'name email avatarURL')
        .populate('tripId', 'title destination startDate endDate status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this._model.countDocuments(query),
    ]);

    return { requests, total };
  }

  async getTripConnections(tripId: string): Promise<IConnectionDocument[]> {
    return await this._model
      .find({
        tripId: tripId,
        status: 'accepted',
      })
      .populate('senderId receiverId', 'name email avatarURL');
  }
}
