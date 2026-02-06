// server/src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/implementation/auth.controller.js';
import { AuthService } from '../services/implementation/auth.service.js';
import { UserRepository } from '../repositories/implementation/user.repository.js';
import { MailService } from '../services/implementation/mail.service.js';
import { validate } from '../middleware/validate.js';
import { loginValidators, registerValidators } from '../middleware/auth.validator.js';
import { protect } from '../middleware/authMiddleware.js';
import { auth } from 'google-auth-library';

const router = Router();

// DI
const mailService = new MailService();
const userRepo=new UserRepository();
const authService = new AuthService(userRepo,mailService);
const authController = new AuthController(authService);

router.post('/register',registerValidators,validate, authController.register);
router.post('/login',loginValidators,validate, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/refresh', authController.refreshToken);
router.post('/google-login', authController.googleLogin);

export default router;
