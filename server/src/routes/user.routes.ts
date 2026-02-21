// src/routes/user.routes.ts
import { Router } from 'express';
import { UserRepository } from '../repositories/implementation/user.repository';
import { UserService } from '../services/implementation/user.service';
import { UserController } from '../controllers/implementation/user.controller';
import { MailService } from '../services/implementation/mail.service';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import { ForgotPasswordDTO, ResetPasswordDTO } from '../dto/user.dto';
import { API_ROUTES } from '../constants/routes.constants';

const router = Router();

// DI
const userRepository = new UserRepository();
const mailService = new MailService();
const userService = new UserService(userRepository, mailService);
const userController = new UserController(userService);

// router.post('/register', userController.registerUser.bind(userController));
router.post(
    API_ROUTES.USER.FORGOT_PASSWORD,
    dtoValidationMiddleware(ForgotPasswordDTO),
    userController.forgotPassword
);

router.get(API_ROUTES.USER.GET_ALL, userController.getUsers);

router.post(
    API_ROUTES.USER.RESET_PASSWORD,
    dtoValidationMiddleware(ResetPasswordDTO),
    userController.resetPassword
);
export default router;