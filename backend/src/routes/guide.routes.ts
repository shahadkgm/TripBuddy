// backend/src/routes/guide.routes.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getAllGuides, getGuideStatus, registerGuide,  } from '../controllers/guide.controller.js';

const router = Router();

const storage = multer.diskStorage({
  destination: 'uploads/guides/',
  filename: (req, file, cb) => {
    cb(null, `guide-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });



router.post('/register', upload.single('avatar'), registerGuide);

router.get('/status/:userId', getGuideStatus);
router.get('/all', getAllGuides);
export default router;