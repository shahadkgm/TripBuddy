import { INotification, INotificationDocument } from '../../types/notification.type';
import { IBaseRepository } from './IBaseRepository';

export interface INotificationRepository extends IBaseRepository<INotificationDocument, Partial<INotification>> {
  getUserNotifications(userId: string): Promise<INotificationDocument[]>;
  deleteAllForUser(userId: string): Promise<void>;
}
