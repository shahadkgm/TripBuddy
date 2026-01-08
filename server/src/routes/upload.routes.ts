// server/src/routes/upload.routes.ts
import { Router } from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { UploadController } from '../controllers/implementation/upload.controller.js';
import { UploadService } from '../services/implementation/upload.service.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
// router.use(protect);

const service = new UploadService();

const controller = new UploadController(service);

router.post('/upload', upload.single('image'), controller.handleFileUpload);
router.get('/kyc-status/:userId', controller.getStatus);

export default router;