// src/routes/user.routes.ts
import { Router } from 'express';
import { UserRepository } from '../repositories/user.repository.js';
import { UserService } from '../services/user.service.js';
import { UserController } from '../controllers/user.controller.js';

const router = Router();

// 1. Manually Inject Dependencies (The "SOLID" way)
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// 2. Define Routes
router.post('/register', userController.registerUser);
router.get('/', userController.getUsers);

export default router;