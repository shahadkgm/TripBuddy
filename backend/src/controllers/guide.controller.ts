// backend/src/controllers/guide.controller.ts
import { Request, Response } from 'express';
import { guideService } from '../services/guide.service.js';

export const registerGuide = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const profile = await guideService.register(userId, req.body, req.file?.filename);
    res.status(201).json({ message: "Application submitted", profile });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const checkGuideStatus = async (req: Request, res: Response) => {
  try {
    const status = await guideService.getStatus(req.params.userId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ message: "Error checking status" });
  }
};