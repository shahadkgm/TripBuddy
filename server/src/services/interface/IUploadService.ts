// server/src/controllers/interfaces/IUploadService.ts
export interface IUploadService {
  saveKYCDocument(file: Express.Multer.File, userId: string, documentType: string): Promise<any>;
  getKYCStatus(userId: string): Promise<any>;
}