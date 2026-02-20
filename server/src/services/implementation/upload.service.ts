// server/src/services/implementation/upload.service.ts
import { IUploadService } from '../interface/IUploadService';
import { IKYCRepository } from '../../repositories/interface/IKycRepository';
import { KYCStatusResponseDTO } from '../../dto/kyc.dto';
import { IKYC } from '../../types/kyc.type';
import { logger } from '@/utils/logger';

export class UploadService implements IUploadService {

  constructor(private readonly _kycRepo: IKYCRepository) { }
  async saveKYCDocument(file: Express.Multer.File, userId: string, docType: string): Promise<IKYC> {
    const newKYC = await this._kycRepo.createKYC(
      file,
      userId,
      docType,
      // status: 'pending' 
    );

    console.log('KYC saved to DB:', newKYC);
    return newKYC;
  }

  async getKYCStatus(userId: string): Promise<KYCStatusResponseDTO> {
    const kyc = await this._kycRepo.findLatestKYCByUserId(userId);

    if (!kyc) {
      console.log(`New user detected: ${userId}. No KYC record found.`);
      return { status: 'none', userId }; // Return a default object instead of null
    }
    logger.info(`KYC found in DB for user ${userId},${kyc.status}`);
    // console.log('KYC found in DB for user:', userId, kyc.status);
    return kyc;
  }
}