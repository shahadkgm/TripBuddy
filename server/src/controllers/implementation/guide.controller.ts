// backend/src/controllers/guide.controller.ts
import { Request, Response } from 'express';
import { IGuideService } from '../../services/interface/IGuideService';
import { StatusCode } from '../../constants/statusCode.enum';
import { logger } from '@/utils/logger';
import { AuthRequest } from '../../types/authRequest';
import { S3File } from '../../types/multer-s3';
import { asyncHandler } from '../../utils/asyncHandler';


export class GuideController {
  constructor(private readonly _guideService: IGuideService) { }

  registerGuide = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    logger.info(`from registerGuide in g-controlleruserId: ${userId}`);

    if (!userId) {
      res.status(StatusCode.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }

    const profile = await this._guideService.register(
      userId,
      req.body,
      (req.file as unknown as S3File)?.location
    );

    res.status(StatusCode.CREATED).json({
      message: 'Application submitted successfully',
      profile
    });
  });

  getGuideStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    logger.info(`userId from getguidestatus ${userId}`);
    const status = await this._guideService.getStatus(userId);
    res.status(StatusCode.OK).json(status);
  });

  getAllGuides = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const guides = await this._guideService.getAllVerifiedGuides(req.query);
    res.status(StatusCode.OK).json(guides);
  });
}