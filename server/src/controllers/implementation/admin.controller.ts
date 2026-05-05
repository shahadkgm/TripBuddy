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
    const { userId } = req.params;
    const { blocked } = req.body;
    const adminId = req.user?.id?.toString() || '';

    const updatedUser = await this._adminService.toggleUserBlock(userId, blocked, adminId);

    this.sendSuccess(res, updatedUser, `User ${blocked ? 'blocked' : 'unblocked'} successfully`);
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const adminId = req.user?.id?.toString() || '';

    await this._adminService.removeUser(userId, adminId);

    this.sendSuccess(res, null, 'User deleted successfully');
  });

  getPendingGuides = asyncHandler(async (req: Request, res: Response) => {
    const guides = await this._adminService.fetchPendingGuides();

    this.sendSuccess(res, guides, 'Pending guides fetched successfully');
  });

  handleVerifyGuide = asyncHandler(async (req: Request, res: Response) => {
    const { guideId } = req.params;
    logger.info(`id from handleverify guide admin${guideId}`);

    const result = await this._adminService.approveGuide(guideId);

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
    const { guideId } = req.params;
    const { reason } = req.body;

    await this._adminService.rejectApplication(guideId, reason);

    this.sendSuccess(res, null, 'Guide application rejected successfully');
  });

  handleApproveKYC = asyncHandler(async (req: Request, res: Response) => {
    const { guideId } = req.params;
    const { status, reason } = req.body;

    await this._adminService.approveKYC(guideId, status, reason);

    this.sendSuccess(res, null, `KYC status updated to ${status} successfully`);
  });

  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    logger.info('call come from admin dashboard ,controller');
    const stats = await this._adminService.getDashboardStats();
    this.sendSuccess(res, stats, 'Dashboard stats fetched successfully');
  });

  getAllPayments = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const data = await this._adminService.getAllPayments(page, limit);
    this.sendSuccess(res, data, 'Payments fetched successfully');
  });

  updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const { status } = req.body;
    const updatedPayment = await this._adminService.updatePaymentStatus(paymentId, status);
    this.sendSuccess(res, updatedPayment, `Payment status updated to ${status} successfully`);
  });

  // Trips
  getAllTrips = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || '');
    const data = await this._adminService.getAllTrips(page, limit, search);
    this.sendSuccess(res, data, 'Trips fetched successfully');
  });

  updateTripStatus = asyncHandler(async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const { status } = req.body;
    const updatedTrip = await this._adminService.updateTripStatus(tripId, status);
    this.sendSuccess(res, updatedTrip, `Trip status updated to ${status} successfully`);
  });

  getRevenueStats = asyncHandler(async (req: Request, res: Response) => {
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const stats = await this._adminService.getRevenueStats(from, to);
    this.sendSuccess(res, stats, 'Revenue stats fetched successfully');
  });
}
