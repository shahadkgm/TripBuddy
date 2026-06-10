import { INotificationRepository } from '../interface/INotificationRepository';
import { INotification, INotificationDocument } from '../../types/notification.type';
import { NotificationModel } from '../../models/notification.model';
import { BaseRepository } from './base.repository';

export class NotificationRepository extends BaseRepository<INotificationDocument, Partial<INotification>> implements INotificationRepository {
  constructor() {
    super(NotificationModel);
  }



  async getUserNotifications(userId: string): Promise<INotificationDocument[]> {
    return await NotificationModel.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name avatarURL');
  }



  async deleteAllForUser(userId: string): Promise<void> {
    await NotificationModel.deleteMany({ recipientId: userId });
  }
}
