import { Express } from 'express';
import { IKYC } from '../../types/kyc.type';

export interface IKYCRepository {
  createKYC(
    file: Express.Multer.File,
    userId: string,
    docType: string
  ): Promise<IKYC>;

  findLatestKYCByUserId(userId: string): Promise<IKYC | null>;
  updateStatus(userId: string, status: string): Promise<IKYC | null>;
}
