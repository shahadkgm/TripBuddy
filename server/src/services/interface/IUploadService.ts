import { KYCStatusResponseDTO} from '../../dto/kyc.dto';
import { IKYC } from '../../types/kyc.type';

// server/src/controllers/interfaces/IUploadService.ts
export interface IUploadService {
  saveKYCDocument(file: Express.Multer.File, userId: string, documentType: string): Promise<IKYC>;
  getKYCStatus(userId: string): Promise<KYCStatusResponseDTO>;
}