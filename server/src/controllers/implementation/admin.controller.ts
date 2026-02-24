import { Request, Response } from 'express';
import { StatusCode } from '../../constants/statusCode.enum';
import { IAdminService } from '../../services/interface/Iadminservice';
import { IAdminController } from '../interfaces/IadminController';
import { asyncHandler } from '../../utils/asyncHandler';
import { logger } from '../../utils/logger';

export class AdminController implements IAdminController {
  constructor(private readonly _adminService: IAdminService) { }

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || '');

    const data = await this._adminService.fetchAllUsers(page, limit, search);
    logger.info(`data from admin controller:${data}`);
    res.status(StatusCode.OK).json(data);
  });

  handleBlockUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { blocked } = req.body;
    const adminId = req.user?.id?.toString() || '';

    const updatedUser = await this._adminService.toggleUserBlock(id, blocked, adminId);

    res.status(StatusCode.OK).json(updatedUser);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user?.id?.toString() || '';

    await this._adminService.removeUser(id, adminId);

    res.status(StatusCode.OK).json({ message: 'User deleted successfully' });
  });

  getPendingGuides = asyncHandler(async (req: Request, res: Response) => {
    const guides = await this._adminService.fetchPendingGuides();

    res.status(StatusCode.OK).json(guides);
  });

  handleVerifyGuide = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    // console.log("id from handlevrify guide admin",id)
    logger.info(`id from handleverify guide admin${id}`);

    const result = await this._adminService.approveGuide(id);

    res.status(StatusCode.OK).json(result);
  });

  getAllGuides = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || '');
    const data = await this._adminService.fetchAllGuides(page, limit, search);
    logger.debug('from get all guide', data);


    res.status(StatusCode.OK).json(data);
  });

  rejectGuide = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await this._adminService.rejectApplication(id);

    res.status(StatusCode.OK).json({
      message: 'Guide application rejected successfully',
    });
  });

  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    logger.info('call come from admin dashboard ,controller');
    const stats = await this._adminService.getDashboardStats();
    res.status(StatusCode.OK).json(stats);
  });
}
