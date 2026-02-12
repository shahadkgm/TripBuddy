import { Request, Response } from 'express';
import { StatusCode } from '../../constants/statusCode.enum.js';
import { IAdminService } from '../../services/interface/Iadminservice.js';
import { IAdminController } from '../interfaces/IadminController.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class AdminController implements IAdminController {
  constructor(private adminService: IAdminService) {}

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || '');

    const data = await this.adminService.fetchAllUsers(page, limit, search);

    res.status(StatusCode.OK).json(data);
  });

  handleBlockUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { blocked } = req.body;
    const adminId = req.user?._id;

    const updatedUser = await this.adminService.toggleUserBlock(id, blocked, adminId);

    res.status(StatusCode.OK).json(updatedUser);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user?._id;

    await this.adminService.removeUser(id, adminId);

    res.status(StatusCode.OK).json({ message: 'User deleted successfully' });
  });

  getPendingGuides = asyncHandler(async (req: Request, res: Response) => {
    const guides = await this.adminService.fetchPendingGuides();

    res.status(StatusCode.OK).json(guides);
  });

  handleVerifyGuide = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.adminService.approveGuide(id);

    res.status(StatusCode.OK).json(result);
  });

  getAllGuides = asyncHandler(async (req: Request, res: Response) => {
    const page=Number(req.query.page)||1;
    const limit=Number(req.query.limit)||10;
    const search=String(req.query.search)||'';
    const data= await this.adminService.fetchAllGuides(page,limit,search);


    res.status(StatusCode.OK).json(data);
  });

  rejectGuide = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await this.adminService.rejectApplication(id);

    res.status(StatusCode.OK).json({
      message: 'Guide application rejected successfully',
    });
  });
}
