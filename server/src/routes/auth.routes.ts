// server/src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/implementation/auth.controller.js";
import { AuthService } from "../services/implementation/auth.service.js";

const router = Router();

// DI
const authService = new AuthService();
const authController = new AuthController(authService);

router.post("/register", authController.register);
router.post("/login", authController.login);

// endpoint Google Authentication
router.post("/google-login", authController.googleLogin);

export default router;
