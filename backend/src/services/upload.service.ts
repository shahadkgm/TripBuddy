// services/upload.service.ts
import { KYC } from '../models/kyc.model.js';
export interface FileData {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

class UploadService {
//   async saveFileInfo(file: Express.Multer.File) {
//     // 1. Prepare the data
//     const fileData: FileData = {
//       filename: file.filename,
//       path: file.path,
//       mimetype: file.mimetype,
//       size: file.size,
//     };

//     // 2. Logic: Save to Database (Pseudo-code for Prisma/Mongoose)
    
//     // await db.image.create({ data: fileData });

//     console.log('File logic processed in Service:', fileData.filename);
    
//     return fileData;
//   }

 // services/upload.service.ts
async saveKYCDocument(file: Express.Multer.File, userId: string, docType: string) {
  const newKYC = await KYC.create({
    userId: userId,
    documentType: docType,
    filePath: file.path, 
    status: 'pending' // FIX: Use the simple string value here, NOT the schema object
  });
  
  console.log("KYC saved to DB:", newKYC);
  return newKYC;
}

}

export const uploadService = new UploadService();