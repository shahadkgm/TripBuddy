import { Request, Response } from 'express';
import { IAdminService } from '../../services/interface/Iadminservice';
import { IAdminController } from '../interfaces/IadminController';
import { asyncHandler } from '../../utils/asyncHandler';
import { logger } from '../../utils/logger';

import { BaseController } from './base.controller';

export class AdminController extends BaseController implements IAdminController {
  constructor(private readonly _adminService: IAdminService) {
    super();
  }

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || '');

    const data = await this._adminService.fetchAllUsers(page, limit, search);
    logger.info(`data from admin controller:${data}`);
    this.sendSuccess(res, data, 'Users fetched successfully');
  });

  handleBlockUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { blocked } = req.body;
    const adminId = req.user?.id?.toString() || '';

    const updatedUser = await this._adminService.toggleUserBlock(id, blocked, adminId);

    this.sendSuccess(res, updatedUser, `User ${blocked ? 'blocked' : 'unblocked'} successfully`);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user?.id?.toString() || '';

    await this._adminService.removeUser(id, adminId);

    this.sendSuccess(res, null, 'User deleted successfully');
  });

  getPendingGuides = asyncHandler(async (req: Request, res: Response) => {
    const guides = await this._adminService.fetchPendingGuides();

    this.sendSuccess(res, guides, 'Pending guides fetched successfully');
  });

  handleVerifyGuide = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    logger.info(`id from handleverify guide admin${id}`);

    const result = await this._adminService.approveGuide(id);

    this.sendSuccess(res, result, 'Guide verified successfully');
  });

  getAllGuides = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || '');
    const data = await this._adminService.fetchAllGuides(page, limit, search);
    logger.debug('from get all guide', data);

    this.sendSuccess(res, data, 'Guides fetched successfully');
  });

  rejectGuide = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await this._adminService.rejectApplication(id);

    this.sendSuccess(res, null, 'Guide application rejected successfully');
  });

  handleApproveKYC = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    await this._adminService.approveKYC(id, status);

    this.sendSuccess(res, null, `KYC status updated to ${status} successfully`);
  });

  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    logger.info('call come from admin dashboard ,controller');
    const stats = await this._adminService.getDashboardStats();
    this.sendSuccess(res, stats, 'Dashboard stats fetched successfully');
  });
}
