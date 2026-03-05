// src/routes/user.routes.ts
import { Router } from 'express';
import { UserRepository } from '../repositories/implementation/user.repository';
import { UserService } from '../services/implementation/user.service';
import { UserController } from '../controllers/implementation/user.controller';
import { MailService } from '../services/implementation/mail.service';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import { ForgotPasswordDTO, ResetPasswordDTO } from '../dto/user.dto';
import { API_ROUTES } from '../constants/routes.constants';

import { protect } from '../middleware/authMiddleware';

const router = Router();

// DI
const userRepository = new UserRepository();
const mailService = new MailService();
const userService = new UserService(userRepository, mailService);
const userController = new UserController(userService);

// Public routes
router.post(
    API_ROUTES.USER.FORGOT_PASSWORD,
    dtoValidationMiddleware(ForgotPasswordDTO),
    userController.forgotPassword
);

router.post(
    API_ROUTES.USER.RESET_PASSWORD,
    dtoValidationMiddleware(ResetPasswordDTO),
    userController.resetPassword
);

// Protected routes
router.use(protect);

router.get(API_ROUTES.USER.GET_ALL, userController.getUsers);
router.patch(API_ROUTES.USER.EDIT_PROFILE, userController.updateProfile);
router.post(API_ROUTES.USER.CHANGE_PASSWORD, userController.changePassword);

export default router;