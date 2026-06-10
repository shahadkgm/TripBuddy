import { INotificationService } from '../interface/INotificationService';
import { INotification, INotificationDocument } from '../../types/notification.type';
import { INotificationRepository } from '../../repositories/interface/INotificationRepository';
import { getIO } from '../../config/socket';

export class NotificationService implements INotificationService {
  constructor(private readonly _notificationRepository: INotificationRepository) {}

  async createNotification(data: Partial<INotification>): Promise<INotificationDocument> {
    const notification = await this._notificationRepository.create(data);
    
    // Emit real-time notification to the recipient using their user ID room
    try {
      const io = getIO();
      if (notification.recipientId) {
        io.to(notification.recipientId.toString()).emit('new_notification', notification);
      }
    } catch (e) {
      console.error('Failed to emit socket event for new notification', e);
    }
    
    return notification;
  }

  async getUserNotifications(userId: string): Promise<INotificationDocument[]> {
    return await this._notificationRepository.getUserNotifications(userId);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this._notificationRepository.deleteById(notificationId);
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this._notificationRepository.deleteAllForUser(userId);
  }
}
