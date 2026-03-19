// server/src/routes/upload.routes.ts
import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { UploadController } from '../controllers/implementation/upload.controller';
import { UploadService } from '../services/implementation/upload.service';
import { KycRepository } from '../repositories/implementation/Kyc.repository';
import { API_ROUTES } from '../constants/routes.constants';

import { protect } from '../middleware/authMiddleware';

const router = Router();
const kycRepository = new KycRepository();
const service = new UploadService(kycRepository);

const controller = new UploadController(service);

// router.use(protect); // Removed to avoid affecting other /api routes

router.post(API_ROUTES.UPLOAD.FILE_UPLOAD, protect, upload.single('image'), controller.handleFileUpload);
router.post(API_ROUTES.UPLOAD.PROFILE_PHOTO, protect, upload.single('avatar'), controller.handleProfilePhotoUpload);
router.post(API_ROUTES.UPLOAD.CHAT_IMAGE, protect, upload.single('chat'), controller.handleChatImageUpload);
router.get(API_ROUTES.UPLOAD.KYC_STATUS, protect, controller.getStatus);

export default router;