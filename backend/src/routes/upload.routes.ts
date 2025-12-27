// routes/upload.routes.ts
import { Router } from 'express';
import { upload } from '../middleware/upload.middleware.js';
// import { handleFileUpload } from '../controllers/upload.controller';
import { Getstatus, handleFileUpload } from '../controllers/upload.controller.js';


const router = Router();

router.post('/upload', upload.single('image'), handleFileUpload);
router.get('/kyc-status/:userId',Getstatus)


export default router;