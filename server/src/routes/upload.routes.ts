// server/src/routes/upload.routes.ts
import { Router } from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { UploadController } from '../controllers/implementation/upload.controller.js';
import { UploadService } from '../services/implementation/upload.service.js';
import { protect } from '../middleware/authMiddleware.js';
import { KycRepository } from '../repositories/implementation/Kyc.repository.js';

const router = Router();
// router.use(protect);
const  kycRepository=new KycRepository();
const service = new UploadService(kycRepository);

const controller = new UploadController(service);

router.post('/upload', upload.single('image'), controller.handleFileUpload);
router.get('/kyc-status/:userId', controller.getStatus);

export default router;