import { Document, Types } from 'mongoose';

export interface IConnection {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  tripId?: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export type IConnectionDocument = IConnection & Document;
