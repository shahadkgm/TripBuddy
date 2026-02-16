// backend/src/controllers/guide.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IGuideService } from '../../services/interface/IGuideService';
import { StatusCode } from '../../constants/statusCode.enum';
import { logger } from '@/utils/logger';
import { AuthRequest } from '../../types/authRequest';

export class GuideController {
  constructor(private readonly _guideService: IGuideService) { }

  registerGuide = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      logger.info(`from registerGuide in g-controlleruserId: ${userId}`);

      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: 'User not authenticated' });
        return;
      }

      const profile = await this._guideService.register( 
        userId,
        req.body,
        req.file?.filename
      );

      res.status(StatusCode.CREATED).json({
        message: 'Application submitted successfully',
        profile
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  getGuideStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      // console.log('userId from getguidestatus ', userId);
      logger.info(`userId from getguidestatus ${userId}`);
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