import { S3File } from '@/types/multer-s3';
import { KYC } from '../../models/kyc.model';
import { IKYC, KYCStatus } from '../../types/kyc.type';
import { IKYCRepository } from '../interface/IKycRepository';

export class KycRepository implements IKYCRepository {
  async createKYC(file: Express.Multer.File, userId: string, docType: string): Promise<IKYC> {
    const doc = await KYC.create({
      userId,
      documentType: docType,
      filePath: (file as unknown as S3File).location || file.path,
      status: 'pending',
    });

    const obj = doc.toObject();

    return {
      ...obj,
      _id: obj._id.toString(),
    };
  }

  async findLatestKYCByUserId(userId: string): Promise<IKYC | null> {
    return KYC.findOne({ userId }).sort({ uploadedAt: -1 }).lean<IKYC>();
  }

  async updateStatus(userId: string, status: KYCStatus, reason?: string): Promise<IKYC | null> {
    const update: { status: KYCStatus; rejectionReason?: string } = { status };
    if (reason) {
      update.rejectionReason = reason;
    }
    return KYC.findOneAndUpdate({ userId }, update, {
      new: true,
      sort: { uploadedAt: -1 },
    }).lean<IKYC>();
  }
}
