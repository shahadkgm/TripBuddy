import { RequestHandler } from 'express';

export interface IAdminController {
  getAllUsers: RequestHandler;
  handleBlockUser: RequestHandler;
  deleteUser: RequestHandler;

  getPendingGuides: RequestHandler;
  handleVerifyGuide: RequestHandler;
  getAllGuides: RequestHandler;
  rejectGuide: RequestHandler;
  handleApproveKYC: RequestHandler;
  getDashboardStats: RequestHandler;
}
