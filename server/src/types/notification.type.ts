import { Types, Document } from 'mongoose';

export interface INotification {
  recipientId: Types.ObjectId | string;
  senderId?: Types.ObjectId | string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationDocument extends INotification, Document {
  _id: Types.ObjectId;
}
