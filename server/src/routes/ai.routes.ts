import express from 'express';
import { AIService } from '../services/implementation/ai.service';
import { AIController } from '../controllers/implementation/ai.controller';
import { protect } from '../middleware/authMiddleware';
import { API_ROUTES } from '../constants/routes.constants';

const router = express.Router();

// DI
const aiService = new AIService();
const aiController = new AIController(aiService);

// Routes
router.post(API_ROUTES.AI.CHAT, protect, aiController.getAIResponse);

export default router;

