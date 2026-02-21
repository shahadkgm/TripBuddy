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
import { API_ROUTES } from '../constants/routes.constants';

const router = Router();
const userRepo = new UserRepository();
// const mailrepo=new MailService();
// const userService=new UserService(userRepo,mailrepo);
const guideRepo = new GuideRepository();
const guideService = new GuideService(guideRepo, userRepo);
const guideController = new GuideController(guideService);



router.post(
  API_ROUTES.GUIDE.REGISTER,
  protect,
  upload.single('avatar'),
  dtoValidationMiddleware(GuideRegisterDTO),
  guideController.registerGuide
);

router.get(API_ROUTES.GUIDE.STATUS, guideController.getGuideStatus);

router.get(API_ROUTES.GUIDE.GET_ALL, guideController.getAllGuides);

export default router;