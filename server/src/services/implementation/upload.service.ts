// server/src/services/implementation/upload.service.ts
import { IUploadService } from '../interface/IUploadService.js';
import { IKYCRepository } from '../../repositories/interface/IKycRepository.js';

export class UploadService implements IUploadService {
  
  constructor(private kycRepo:IKYCRepository){}
  async saveKYCDocument(file: Express.Multer.File, userId: string, docType: string): Promise<any> {
    const newKYC = await this.kycRepo.createKYC(
      file,
       userId,
       docType,
      // status: 'pending' 
    );
    
    console.log("KYC saved to DB:", newKYC);
    return newKYC;
  }

  async getKYCStatus(userId: string): Promise<any> {
  const kyc = await this.kycRepo.findLatestKYCByUserId(  userId )
  
  if (!kyc) {
    console.log(`New user detected: ${userId}. No KYC record found.`);
    return { status: 'none',userId }; // Return a default object instead of null
  }

  console.log("KYC found in DB for user:", userId, kyc.status);
  return kyc;
}
}