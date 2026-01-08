// server/src/services/implementation/upload.service.ts
import { KYC } from '../../models/kyc.model.js';
import { IUploadService } from '../../controllers/interfaces/IUploadService.js';

export class UploadService implements IUploadService {
  
  /**
   * Logic to save a new KYC document to the database
   */
  async saveKYCDocument(file: Express.Multer.File, userId: string, docType: string): Promise<any> {
    const newKYC = await KYC.create({
      userId: userId,
      documentType: docType,
      filePath: file.path, 
      status: 'pending' 
    });
    
    console.log("KYC saved to DB:", newKYC);
    return newKYC;
  }

  async getKYCStatus(userId: string): Promise<any> {
  const kyc = await KYC.findOne({ userId: userId }).sort({ uploadedAt: -1 }).lean();
  
  if (!kyc) {
    console.log(`New user detected: ${userId}. No KYC record found.`);
    return { status: 'none',userId }; // Return a default object instead of null
  }

  console.log("KYC found in DB for user:", userId, kyc.status);
  return kyc;
}
}