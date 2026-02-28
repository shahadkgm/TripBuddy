import { ConnectionModel } from '../../../models/connection.model';
import { IConnectionDocument } from '../../../types/connection.type';
import { BaseRepository } from './base.repository';
import { IConnectionRepository } from '../interface/IConnectionRepository';
import { CreateConnectionDTO } from '../../../dto/connection.dto';
import { FilterQuery } from 'mongoose';

export class ConnectionRepository extends BaseRepository<IConnectionDocument, CreateConnectionDTO> implements IConnectionRepository {
    constructor() {
        super(ConnectionModel);
    }

    async findByUsers(senderId: string, receiverId: string, tripId?: string): Promise<IConnectionDocument | null> {
        const query: FilterQuery<IConnectionDocument> = { senderId, receiverId };
        if (tripId) query.tripId = tripId;
        return await this._model.findOne(query);
    }

    async getUserConnections(userId: string): Promise<IConnectionDocument[]> {
        return await this._model.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
            status: 'accepted'
        }).populate('senderId receiverId', 'name email avatarURL');
    }

    async getPendingRequests(userId: string): Promise<IConnectionDocument[]> {
        return await this._model.find({
            receiverId: userId,
            status: 'pending'
        }).populate('senderId', 'name email avatarURL');
    }
}
