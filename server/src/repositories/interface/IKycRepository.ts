import { Express } from "express";

export interface IKYCRepository {
  createKYC(
    file: Express.Multer.File,
    userId: string,
    docType: string
  ): Promise<any>;

  findLatestKYCByUserId(userId: string): Promise<any | null>;
}
