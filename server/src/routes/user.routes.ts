// src/routes/user.routes.ts
import { Router } from 'express';
import { UserRepository } from '../repositories/implementation/user.repository';
import { UserService } from '../services/implementation/user.service';
import { UserController } from '../controllers/implementation/user.controller';
import { MailService } from '../services/implementation/mail.service';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import { ForgotPasswordDTO, ResetPasswordDTO } from '../dto/user.dto';

const router = Router();

// DI
const userRepository = new UserRepository();
const mailService = new MailService();
const userService = new UserService(userRepository, mailService);
const userController = new UserController(userService);

// router.post('/register', userController.registerUser.bind(userController));
router.post(
    '/forgot-password',
    dtoValidationMiddleware(ForgotPasswordDTO),
    userController.forgotPassword
);

router.get('/', userController.getUsers);

router.post(
    '/reset-password/:token',
    dtoValidationMiddleware(ResetPasswordDTO),
    userController.resetPassword
);
export default router;