// src/routes/user.routes.ts
import { Router } from 'express';
import { UserRepository } from '../repositories/user.repository.js';
import { UserService } from '../services/user.service.js';
import { UserController } from '../controllers/user.controller.js';
import { MailService } from '../services/mail.service.js'; // Import class

const router = Router();

// 1. Manually Inject Dependencies
const userRepository = new UserRepository();
const mailService = new MailService(); // Create instance
const userService = new UserService(userRepository, mailService); 
const userController = new UserController(userService);

// 2. Define Routes
router.post('/register', userController.registerUser.bind(userController));
router.post('/forgot-password', userController.forgotPassword.bind(userController));
router.get('/', userController.getUsers.bind(userController));
router.post('/reset-password/:token', userController.resetPassword.bind(userController));
export default router;