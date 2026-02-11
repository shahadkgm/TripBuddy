import { KYCStatusResponseDTO, SaveKYCResponseDTO } from "../../dto/kyc.dto.js";
import { IKYC } from "../../types/kyc.type.js";

// server/src/controllers/interfaces/IUploadService.ts
export interface IUploadService {
  saveKYCDocument(file: Express.Multer.File, userId: string, documentType: string): Promise<IKYC>;
  getKYCStatus(userId: string): Promise<KYCStatusResponseDTO>;
}