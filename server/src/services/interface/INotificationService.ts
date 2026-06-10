import { INotification, INotificationDocument } from '../../types/notification.type';

export interface INotificationService {
  createNotification(data: Partial<INotification>): Promise<INotificationDocument>;
  getUserNotifications(userId: string): Promise<INotificationDocument[]>;
  deleteNotification(notificationId: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
}
