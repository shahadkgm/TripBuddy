// backend/src/controllers/guide.controller.ts
import { Request, Response } from 'express';
import { IGuideService } from '../../services/interface/IGuideService';
import { StatusCode } from '../../constants/statusCode.enum';
import { logger } from '@/utils/logger';
import { AuthRequest } from '../../types/authRequest';
import { S3File } from '../../types/multer-s3';
import { asyncHandler } from '../../utils/asyncHandler';
import { GuideRegisterDTO } from '../../dto/guide.dto';

import { BaseController } from './base.controller';

export class GuideController extends BaseController {
  constructor(private readonly _guideService: IGuideService) {
    super();
  }

  registerGuide = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    logger.info(`from registerGuide in g-controlleruserId: ${userId}`);

    if (!userId) {
      this.sendError(res, 'User not authenticated', StatusCode.UNAUTHORIZED);
      return;
    }

    const profile = await this._guideService.register(
      userId,
      req.body as GuideRegisterDTO,
      (req.file as unknown as S3File)?.location
    );

    this.sendCreated(res, profile, 'Application submitted successfully');
  });

  getGuideStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    logger.info(`userId from getguidestatus ${userId}`);
    const status = await this._guideService.getStatus(userId);
    this.sendSuccess(res, status, 'Guide status fetched successfully');
  });

  getAllGuides = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const guides = await this._guideService.getAllVerifiedGuides(req.query);
    this.sendSuccess(res, guides, 'Guides fetched successfully');
  });
}