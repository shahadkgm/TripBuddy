import { Express } from 'express';
import { IKYC, KYCStatus } from '../../types/kyc.type';

export interface IKYCRepository {
  createKYC(file: Express.Multer.File, userId: string, docType: string): Promise<IKYC>;

  findLatestKYCByUserId(userId: string): Promise<IKYC | null>;
  updateStatus(userId: string, status: KYCStatus, reason?: string): Promise<IKYC | null>;
}
