import { Router } from 'express';
import { GalleryRepository } from '../repositories/implementation/gallery.repository';
import { GalleryService } from '../services/implementation/gallery.service';
import { GalleryController } from '../controllers/implementation/gallery.controller';
import { protect } from '../middleware/authMiddleware';
import { API_ROUTES } from '../constants/routes.constants';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// DI
const repository = new GalleryRepository();
const service = new GalleryService(repository);
const controller = new GalleryController(service);

router.use(protect);

// Upload memory photo - uses fieldname 'gallery' for proper folder organization
router.post(API_ROUTES.GALLERY.UPLOAD, upload.single('gallery'), controller.uploadImage);

// Create memory post
router.post(API_ROUTES.GALLERY.CREATE, controller.createPost);

// View all trip memories
router.get(API_ROUTES.GALLERY.GET_ALL, controller.getAllPosts);

export default router;
