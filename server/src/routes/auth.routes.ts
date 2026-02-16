// server/src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/implementation/auth.controller';
import { AuthService } from '../services/implementation/auth.service';
import { UserRepository } from '../repositories/implementation/user.repository';
import { MailService } from '../services/implementation/mail.service';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import { RegisterUserDTO, LoginDTO } from '../dto/auth.dto';

const router = Router();

// DI
const mailService = new MailService();
const userRepo = new UserRepository();
const authService = new AuthService(userRepo, mailService);
const authController = new AuthController(authService);

router.post(
    '/register',
    dtoValidationMiddleware(RegisterUserDTO),
    authController.register
);

router.post(
    '/login',
    dtoValidationMiddleware(LoginDTO),
    authController.login
);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/refresh', authController.refreshToken);
router.post('/google-login', authController.googleLogin);

export default router;
