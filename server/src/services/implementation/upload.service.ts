// server/src/services/implementation/upload.service.ts
import { IUploadService } from '../interface/IUploadService';
import { IKYCRepository } from '../../domain/repositories/interface/IKycRepository';
import { KYCStatusResponseDTO } from '../../dto/kyc.dto';
import { IKYC } from '../../types/kyc.type';
import { logger } from '@/utils/logger';

export class UploadService implements IUploadService {

  constructor(private readonly _kycRepo: IKYCRepository) { }
  async saveKYCDocument(file: Express.Multer.File, userId: string, docType: string): Promise<IKYC> {
    logger.info(`Processing KYC document for user: ${userId}, type: ${docType}`);
    const newKYC = await this._kycRepo.createKYC(
      file,
      userId,
      docType,
    );

    logger.info(`KYC document saved to database for user: ${userId}`);
    return newKYC;
  }

  async getKYCStatus(userId: string): Promise<KYCStatusResponseDTO> {
    logger.info(`Fetching KYC status for user: ${userId}`);
    const kyc = await this._kycRepo.findLatestKYCByUserId(userId);

    if (!kyc) {
      logger.info(`No KYC record found for user: ${userId}`);
      return { status: 'none', userId };
    }
    logger.info(`KYC status for user ${userId}: ${kyc.status}`);
    return kyc;
  }
}