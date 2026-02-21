import express from 'express';
import { AdminRepository } from '../repositories/implementation/admin.repository';
import { AdminService } from '../services/implementation/admin.service';
import { AdminController } from '../controllers/implementation/admin.controller';
import { isAdmin, protect } from '../middleware/authMiddleware';
import { API_ROUTES } from '../constants/routes.constants';

const router = express.Router();

// DI
const adminRepo = new AdminRepository();
const adminService = new AdminService(adminRepo);
const adminController = new AdminController(adminService);

// Routes
router.use(protect, isAdmin);

router.get(API_ROUTES.ADMIN.USERS, adminController.getAllUsers);
router.patch(API_ROUTES.ADMIN.USER_BLOCK, adminController.handleBlockUser);
router.delete(API_ROUTES.ADMIN.USER_DELETE, adminController.deleteUser);
//guide
router.get(API_ROUTES.ADMIN.GUIDES_PENDING, adminController.getPendingGuides);
router.patch(API_ROUTES.ADMIN.GUIDE_VERIFY, adminController.handleVerifyGuide);
router.get(API_ROUTES.ADMIN.GUIDES_ALL, adminController.getAllGuides);
router.delete(API_ROUTES.ADMIN.GUIDE_REJECT, protect, isAdmin, adminController.rejectGuide);

router.get(API_ROUTES.ADMIN.STATS, adminController.getDashboardStats);

export default router;