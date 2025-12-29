// backend/src/routes/guide.routes.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
// Import the updated controller functions
import { registerGuide, checkGuideStatus } from '../controllers/guide.controller.js';

const router = Router();

// Configure storage for guide profile photos
const storage = multer.diskStorage({
  destination: 'uploads/guides/',
  filename: (req, file, cb) => {
    // Ensuring unique filenames for guide avatars
    cb(null, `guide-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

/**
 * SOLID: Route handles only the mapping of HTTP verbs to Controller logic
 */

// POST: Submit a new application with a single avatar image
router.post('/register', upload.single('avatar'), registerGuide);

// GET: Fetch the current status (pending/verified) for a specific user
router.get('/status/:userId', checkGuideStatus);

export default router;