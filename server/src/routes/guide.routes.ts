// backend/src/routes/guide.routes.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';

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

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: 'uploads/guides/',
  filename: (req, file, cb) => {
    cb(null, `guide-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });


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