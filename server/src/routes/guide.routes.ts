// backend/src/routes/guide.routes.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';

import { GuideService } from '../services/implementation/guide.service.js';
import { GuideRepository } from '../repositories/implementation/guide.repository.js';
import { GuideController } from '../controllers/implementation/guide.controller.js';
 import { protect } from '../middleware/authMiddleware.js'; 

const router = Router();

const guideRepo = new GuideRepository();
const guideService = new GuideService(guideRepo);
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
  guideController.registerGuide
);

// Get status of a specific user/guide
router.get('/status/:userId', guideController.getGuideStatus);

// Get all verified guides (Public)
router.get('/all', guideController.getAllGuides);

export default router;