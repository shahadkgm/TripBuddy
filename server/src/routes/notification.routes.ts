import { Router } from 'express';
import { NotificationController } from '../controllers/implementation/notification.controller';
import { NotificationService } from '../services/implementation/notification.service';
import { NotificationRepository } from '../repositories/implementation/notification.repository';
import { protect } from '@/middleware/authMiddleware';

const router = Router();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

router.use(protect);

router.get('/', notificationController.getUserNotifications);
router.delete('/all', notificationController.deleteAllNotifications);
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
