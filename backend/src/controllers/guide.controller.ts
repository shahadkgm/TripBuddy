// backend/src/controllers/guide.controller.ts
import { Request, Response } from 'express';
import { guideService } from '../instances.js';

export const registerGuide = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const profile = await guideService.register(userId, req.body, req.file?.filename);
    res.status(201).json({ message: "Application submitted successfully", profile });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getGuideStatus = async (req: Request, res: Response) => {
  try {
    const status = await guideService.getStatus(req.params.userId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: "Error checking status" });
  }
};
export const getAllGuides = async (req: Request, res: Response) => {
  try {
    // The query object contains filters like ?destination=Goa&maxPrice=50
    const guides = await guideService.getAllVerifiedGuides(req.query);
    
    res.status(200).json(guides);
  } catch (error: any) {
    console.error("Fetch Guides Error:", error);
    res.status(500).json({ message: "Server error while fetching guides" });
  }
};