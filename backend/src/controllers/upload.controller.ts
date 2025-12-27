// controllers/upload.controller.ts
import { Request, Response } from 'express';
import { uploadService } from '../services/upload.service.js';
import { KYC } from '../models/kyc.model.js';

export const handleFileUpload = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { userId, documentType } = req.body; 

        if (!userId || !documentType) {
            return res.status(400).json({ message: 'User ID and Document Type are required' });
        }

        const kycRecord = await uploadService.saveKYCDocument(
            req.file, 
            userId, 
            documentType
        );

        return res.status(201).json({
            message: 'KYC Document uploaded and pending approval',
            data: kycRecord
        });
        
    } catch (error) {
        return res.status(500).json({ message: 'Upload failed', error });
    }
};
export const Getstatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log("userid",userId)
    console.log("from getstatus")
    // This searches the 'userId' field in your KYC collection
    const kyc = await KYC.findOne({ userId: userId }).sort({ uploadedAt: -1 });
    console.log("kyc",kyc)

    if (!kyc) {
      // If no record is found, return 404 or a specific message
      return res.status(200).json({ status: 'none', message: 'No record found' });
    }

    // Return the full object so docType and date show up
    return res.json(kyc); 
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ message: "Server error" });
  }
};