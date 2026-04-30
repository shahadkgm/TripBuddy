// server/src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/implementation/auth.controller';
import { AuthService } from '../services/implementation/auth.service';
import { UserRepository } from '../repositories/implementation/user.repository';
import { MailService } from '../services/implementation/mail.service';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import { RegisterUserDTO, LoginDTO } from '../dto/auth.dto';
import { API_ROUTES } from '../constants/routes.constants';

const router = Router();

// DI
const mailService = new MailService();
const userRepo = new UserRepository();
const authService = new AuthService(userRepo, mailService);
const authController = new AuthController(authService);

router.post(
  API_ROUTES.AUTH.REGISTER,
  dtoValidationMiddleware(RegisterUserDTO),
  authController.register
);

router.post(API_ROUTES.AUTH.LOGIN, dtoValidationMiddleware(LoginDTO), authController.login);
router.get(API_ROUTES.AUTH.VERIFY_EMAIL, authController.verifyEmail);
router.post(API_ROUTES.AUTH.REFRESH, authController.refreshToken);
router.post(API_ROUTES.AUTH.GOOGLE_LOGIN, authController.googleLogin);

export default router;
