// server/src/controllers/implementation/upload.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IUploadService } from '../interfaces/IUploadService.js';
import { StatusCode } from '../../constants/statusCode.enum.js';

export class UploadController {
  constructor(private readonly _uploadService: IUploadService) {}

  handleFileUpload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
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
    } catch (error) {
      next(error);
    }
  };

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;

      // 1. Validate Input First
      if (!userId) {
        res.status(StatusCode.BAD_REQUEST).json({ message: "User ID is required" });
        return;
      }

      // 2. Single Service Call
      const kyc = await this._uploadService.getKYCStatus(userId);

      // 3. Handle Null Result (New User Case)
      if (!kyc) {
        res.status(StatusCode.OK).json({ 
          status: 'none', 
          message: 'No record found' 
        });
        return;
      }

      // 4. Return Success
      res.status(StatusCode.OK).json(kyc);
    } catch (error) {
      console.error("Upload Controller error:", error);
      next(error);
    }
  };
}