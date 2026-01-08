import express from 'express';
import { AdminRepository } from '../repositories/implementation/admin.repository.js';
import { AdminService } from '../services/implementation/admin.service.js';
import { AdminController } from '../controllers/implementation/admin.controller.js';
import { isAdmin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// DI
const adminRepo = new AdminRepository();
const adminService = new AdminService(adminRepo);
const adminController = new AdminController(adminService);

// Routes
router.use(protect, isAdmin);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/block', adminController.handleBlockUser);
router.delete('/users/:id', adminController.deleteUser);
//guide
router.get('/guides/pending', adminController.getPendingGuides);
router.patch('/guides/:id/verify', adminController.handleVerifyGuide);
router.get('/guides', adminController.getAllGuides);
router.delete('/guides/:id', protect, isAdmin, adminController.rejectGuide);

export default router;