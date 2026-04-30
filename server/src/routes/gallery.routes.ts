import { Router } from 'express';
import { GalleryRepository } from '../repositories/implementation/gallery.repository';
import { ConnectionRepository } from '../repositories/implementation/connection.repository';
import { GalleryService } from '../services/implementation/gallery.service';
import { GalleryController } from '../controllers/implementation/gallery.controller';
import { protect } from '../middleware/authMiddleware';
import { API_ROUTES } from '../constants/routes.constants';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// DI
const repository = new GalleryRepository();
const connectionRepo = new ConnectionRepository();
const service = new GalleryService(repository, connectionRepo);
const controller = new GalleryController(service);

router.use(protect);

// Upload memory photo - uses fieldname 'gallery' for proper folder organization
router.post(API_ROUTES.GALLERY.UPLOAD, upload.single('gallery'), controller.uploadImage);

// Create memory post
router.post(API_ROUTES.GALLERY.CREATE, controller.createPost);

// View all trip memories (Admin might use this or we adjust it later)
router.get(API_ROUTES.GALLERY.GET_ALL, controller.getAllPosts);

// View specific user's gallery (Personal/Connect-only)
router.get(API_ROUTES.GALLERY.GET_USER_GALLERY, controller.getUserGallery);

export default router;
