import { KYC } from '../../models/kyc.model.js';
import { IKYC } from '../../types/kyc.type.js';
import { IKYCRepository } from '../interface/IKycRepository.js';


export class KycRepository implements IKYCRepository {

  async createKYC(
    file: Express.Multer.File,
    userId: string,
    docType: string,
  ): Promise<IKYC> {

    const doc = await KYC.create({
      userId,
      documentType: docType,
      filePath: file.path,
      status: 'pending'
    });

    const obj = doc.toObject();

return {
  ...obj,
  _id: obj._id.toString(),
};
  }

  async findLatestKYCByUserId(userId: string): Promise<IKYC | null> {
    return KYC
      .findOne({ userId })
      .sort({ uploadedAt: -1 })
      .lean<IKYC>();
  }
}
