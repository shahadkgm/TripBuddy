import { Express } from 'express';
import { IKYC } from '../../types/kyc.type.js';

export interface IKYCRepository {
  createKYC(
    file: Express.Multer.File,
    userId: string,
    docType: string
  ): Promise<IKYC>;

  findLatestKYCByUserId(userId: string): Promise<IKYC | null>;
}
