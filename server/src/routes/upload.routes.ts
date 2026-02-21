// server/src/routes/upload.routes.ts
import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { UploadController } from '../controllers/implementation/upload.controller';
import { UploadService } from '../services/implementation/upload.service';
import { KycRepository } from '../repositories/implementation/Kyc.repository';
import { API_ROUTES } from '../constants/routes.constants';

const router = Router();
const kycRepository = new KycRepository();
const service = new UploadService(kycRepository);

const controller = new UploadController(service);

router.post(API_ROUTES.UPLOAD.FILE_UPLOAD, upload.single('image'), controller.handleFileUpload);
router.get(API_ROUTES.UPLOAD.KYC_STATUS, controller.getStatus);

export default router;