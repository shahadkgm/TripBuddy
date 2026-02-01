import { KYC } from "../../models/kyc.model.js";
import { IKYCRepository } from "../interface/IKycRepository.js";




export class KycRepository implements IKYCRepository{
    async createKYC(
        file:Express.Multer.File,
        userId:string,
        docType:string,
    ):Promise<any>{
        return await KYC.create({
            userId,
            documentType:docType,
            filePath:file.path,
            status:"pending"
        });
    }
    async  findLatestKYCByUserId(userId:string):Promise<any|null>{
        return await KYC.findOne({userId}).sort({updloadeAt:-1}).lean();
    }

    
}