// src/routes/user.routes.ts

import { Router } from 'express';
// IMPT: Using .js extension for the Controller file
import { registerUser, getUsers } from '../controllers/user.controller.js'; 

const router = Router();

// POST /api/users/register
router.post('/register', registerUser);

// GET /api/users
router.get('/', getUsers);

export default router;