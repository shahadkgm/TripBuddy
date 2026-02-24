// server/src/controllers/implementation/upload.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IUploadService } from '../../services/interface/IUploadService';
import { StatusCode } from '../../constants/statusCode.enum';
import { asyncHandler } from '../../utils/asyncHandler';

export class UploadController {
  constructor(private readonly _uploadService: IUploadService) { }

  handleFileUpload = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(StatusCode.BAD_REQUEST).json({ message: 'No file uploaded' });
      return;
    }

    const { userId, documentType } = req.body;

    if (!userId || !documentType) {
      res.status(StatusCode.BAD_REQUEST).json({ message: 'User ID and Document Type are required' });
      return;
    }

    const kycRecord = await this._uploadService.saveKYCDocument(
      req.file,
      userId,
      documentType
    );

    res.status(StatusCode.CREATED).json({
      message: 'KYC Document uploaded and pending approval',
      data: kycRecord
    });
  });

  getStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    if (!userId) {
      res.status(StatusCode.BAD_REQUEST).json({ message: 'User ID is required' });
      return;
    }

    const kyc = await this._uploadService.getKYCStatus(userId);

    if (!kyc) {
      res.status(StatusCode.OK).json({
        status: 'none',
        message: 'No record found'
      });
      return;
    }

    res.status(StatusCode.OK).json(kyc);
  });
}