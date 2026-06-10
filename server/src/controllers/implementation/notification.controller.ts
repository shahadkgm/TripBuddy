import { Response } from 'express';
import { INotificationService } from '../../services/interface/INotificationService';
import { asyncHandler } from '../../utils/asyncHandler';
import { BaseController } from './base.controller';
import { AuthRequest } from '../../types/authRequest';

export class NotificationController extends BaseController {
  constructor(private readonly _notificationService: INotificationService) {
    super();
  }

  getUserNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    const notifications = await this._notificationService.getUserNotifications(userId);
    this.sendSuccess(res, notifications, 'Notifications fetched successfully');
  });

  deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { notificationId } = req.params;
    await this._notificationService.deleteNotification(notificationId);
    this.sendSuccess(res, null, 'Notification deleted successfully');
  });

  deleteAllNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    await this._notificationService.deleteAllForUser(userId);
    this.sendSuccess(res, null, 'All notifications deleted successfully');
  });
}
