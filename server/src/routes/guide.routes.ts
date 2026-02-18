// backend/src/routes/guide.routes.ts
import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { GuideService } from '../services/implementation/guide.service';
import { GuideRepository } from '../repositories/implementation/guide.repository';
import { GuideController } from '../controllers/implementation/guide.controller';

import { UserRepository } from '../repositories/implementation/user.repository';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import { GuideRegisterDTO } from '../dto/guide.dto';
import { protect } from '../middleware/authMiddleware';

const router = Router();
const userRepo = new UserRepository();
// const mailrepo=new MailService();
// const userService=new UserService(userRepo,mailrepo);
const guideRepo = new GuideRepository();
const guideService = new GuideService(guideRepo, userRepo);
const guideController = new GuideController(guideService);



router.post(
  '/register',
  protect,
  upload.single('avatar'),
  dtoValidationMiddleware(GuideRegisterDTO),
  guideController.registerGuide
);

router.get('/status/:userId', guideController.getGuideStatus);

router.get('/all', guideController.getAllGuides);

export default router;