// backend/src/controllers/guide.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IGuideService } from '../../services/interface/IGuideService.js';
import { StatusCode } from "../../constants/statusCode.enum.js";

export class GuideController {
  constructor(private readonly _guideService: IGuideService) {}

  registerGuide = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id; 

      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "User not authenticated" });
        return;
      }

      const profile = await this._guideService.register(
        userId,
        req.body,
        req.file?.filename
      );

      res.status(StatusCode.CREATED).json({ 
        message: "Application submitted successfully", 
        profile 
      });
    } catch (error) {
      console.log(error)
      next(error); 
    }
  };

  getGuideStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      console.log("userId from getguidestatus ",userId)
      const status = await this._guideService.getStatus(userId);
      res.status(StatusCode.OK).json(status);
    } catch (error) {
      next(error);
    }
  };

  getAllGuides = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const guides = await this._guideService.getAllVerifiedGuides(req.query);
      res.status(StatusCode.OK).json(guides);
    } catch (error) {
      next(error);
    }
  };
}