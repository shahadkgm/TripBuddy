import { KYC } from '../../models/kyc.model.js';
import { IKYC } from '../../types/kyc.type.js';
import { IKYCRepository } from '../interface/IKycRepository.js';




export class KycRepository implements IKYCRepository{
    async createKYC(
        file:Express.Multer.File,
        userId:string,
        docType:string,
    ):Promise<IKYC>{
        const doc=await KYC.create({
            userId,
            documentType:docType,
            filePath:file.path,
            status:'pending'
        });
        return this.toIKYC(doc)
    };
    async  findLatestKYCByUserId(userId:string):Promise<IKYC|null>{
        return await KYC.findOne({userId}).sort({updloadeAt:-1}).lean<IKYC>();
    };
    
    private toIKYC(doc: any): IKYC {
    return {
      _id: doc._id.toString(),
      userId: doc.userId,
      documentType: doc.documentType,
      filePath: doc.filePath,
      status: doc.status,
      uploadedAt: doc.uploadedAt
    };
  };

    
}