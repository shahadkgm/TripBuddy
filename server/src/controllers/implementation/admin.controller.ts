import { Request, Response } from 'express';
import { AdminService } from '../../services/implementation/admin.service.js';
import { StatusCode } from '../../constants/statusCode.enum.js';
import { IAdminService } from '../../services/interface/Iadminservice.js';
import { IAdminController } from '../interfaces/IadminController.js';

export class AdminController implements IAdminController {
  constructor(private adminService: IAdminService) {}

  getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const data = await this.adminService.fetchAllUsers(page, limit, search);
    
    // Returns { users: [...], totalPages: x, ... }
    res.status(StatusCode.OK).json(data);
  } catch (error: any) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

  handleBlockUser = async (req:Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log("from admin",id)
      const { blocked } = req.body;
       console.log("from admin block",blocked )
//         if(!req.user?._id){
// return res.status(StatusCode.UNAUTHORIZED).json({message:"unauthorized from admin cntrl"})
//         }
      const adminId = (req as any).user._id;

      const updatedUser = await this.adminService.toggleUserBlock(id, blocked, adminId);
      res.status(StatusCode.OK).json(updatedUser);
    } catch (error: any) {
      console.log("error from admin handleblock ",error)
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminId = (req as any).user._id;

      await this.adminService.removeUser(id, adminId);
      res.status(StatusCode.OK).json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
    }
  }

  //guide
  getPendingGuides = async (req: Request, res: Response) => {
  try {
    const guides = await this.adminService.fetchPendingGuides();
    res.status(StatusCode.OK).json(guides);
  } catch (error: any) {
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

handleVerifyGuide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await this.adminService.approveGuide(id);
    res.status(StatusCode.OK).json({ message: "Guide verified successfully", result });
  } catch (error: any) {
    res.status(StatusCode.BAD_REQUEST).json({ message: error.message });
  }
};
getAllGuides = async (req:Request, res:Response) => {
  const guides = await this.adminService.fetchAllGuides();
  res.status(StatusCode.OK).json(guides);
};


rejectGuide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await this.adminService.rejectApplication(id); 
    
    res.status(StatusCode.OK).json({ 
      message: "Guide application rejected successfully" 
    });
  } catch (error: any) {
    res.status(StatusCode.BAD_REQUEST).json({ 
      message: error.message || "Failed to reject application" 
    });
  }
};



}