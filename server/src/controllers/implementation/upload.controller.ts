// server/src/controllers/implementation/upload.controller.ts
import { Request, Response } from 'express';
import { IUploadService } from '../../services/interface/IUploadService';
import { asyncHandler } from '../../utils/asyncHandler';
import { BaseController } from './base.controller';

export class UploadController extends BaseController {
  constructor(private readonly _uploadService: IUploadService) {
    super();
  }

  handleFileUpload = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      this.sendBadRequest(res, 'No file uploaded');
      return;
    }

    const { userId, documentType } = req.body;

    if (!userId || !documentType) {
      this.sendBadRequest(res, 'User ID and Document Type are required');
      return;
    }

    const kycRecord = await this._uploadService.saveKYCDocument(
      req.file,
      userId,
      documentType
    );

    this.sendCreated(res, kycRecord, 'KYC Document uploaded and pending approval');
  });

  getStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    if (!userId) {
      this.sendBadRequest(res, 'User ID is required');
      return;
    }

    const kyc = await this._uploadService.getKYCStatus(userId);

    if (!kyc) {
      this.sendSuccess(res, { status: 'none' }, 'No record found');
      return;
    }

    this.sendSuccess(res, kyc, 'KYC status fetched successfully');
  });

  handleProfilePhotoUpload = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      this.sendBadRequest(res, 'No file uploaded');
      return;
    }
    // multer-s3 adds 'location' to req.file, we cast it to access it safely
    const s3File = req.file as Express.Multer.File & { location: string };
    const imageUrl = s3File.location;
    this.sendCreated(res, { imageUrl }, 'Profile photo uploaded successfully');
  });

  handleChatImageUpload = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      this.sendBadRequest(res, 'No file uploaded');
      return;
    }
    const s3File = req.file as Express.Multer.File & { location: string };
    const imageUrl = s3File.location;
    this.sendCreated(res, { imageUrl }, 'Chat image uploaded successfully');
  });
}
