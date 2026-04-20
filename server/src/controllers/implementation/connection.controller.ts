import { Request, Response } from 'express';
import { IConnectionService } from '../../services/interface/IConnectionService';
import { StatusCode } from '../../constants/statusCode.enum';
import { AuthRequest } from '../../types/authRequest';
import { asyncHandler } from '../../utils/asyncHandler';

import { BaseController } from './base.controller';

export class ConnectionController extends BaseController {
  constructor(private _connectionService: IConnectionService) {
    super();
  }

  sendRequest = asyncHandler(
    async (
      req: AuthRequest<Record<string, string>, unknown, { receiverId: string; tripId: string }>,
      res: Response
    ) => {
      const senderId = req.user?.id;
      const { receiverId, tripId } = req.body;

      if (!senderId) {
        this.sendError(res, 'User not authenticated', StatusCode.UNAUTHORIZED);
        return;
      }

      if (senderId === receiverId) {
        this.sendBadRequest(res, 'You cannot connect with yourself');
        return;
      }

      const request = await this._connectionService.sendRequest(senderId, receiverId, tripId);
      this.sendCreated(res, request, 'Connection request sent successfully');
    }
  );

  acceptRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const updated = await this._connectionService.acceptRequest(requestId);
    this.sendSuccess(res, updated, 'Connection request accepted');
  });

  rejectRequest = asyncHandler(async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const updated = await this._connectionService.rejectRequest(requestId);
    this.sendSuccess(res, updated, 'Connection request rejected');
  });

  getPendingRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.sendError(res, 'User not authenticated', StatusCode.UNAUTHORIZED);
      return;
    }
    const requests = await this._connectionService.getPendingRequests(userId);
    this.sendSuccess(res, requests, 'Pending requests fetched successfully');
  });

  getSentRequests = asyncHandler(
    async (
      req: AuthRequest<Record<string, string>, unknown, unknown, { page?: string; limit?: string }>,
      res: Response
    ) => {
      const userId = req.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        this.sendError(res, 'User not authenticated', StatusCode.UNAUTHORIZED);
        return;
      }
      const data = await this._connectionService.getSentRequests(userId, page, limit);
      this.sendSuccess(res, data, 'Sent requests fetched successfully');
    }
  );

  getConnectionStatus = asyncHandler(
    async (
      req: AuthRequest<
        Record<string, string>,
        unknown,
        unknown,
        { receiverId: string; tripId: string }
      >,
      res: Response
    ) => {
      const senderId = req.user?.id;
      const { receiverId, tripId } = req.query;

      if (!senderId) {
        this.sendError(res, 'User not authenticated', StatusCode.UNAUTHORIZED);
        return;
      }

      const status = await this._connectionService.getConnectionStatus(
        senderId,
        receiverId as string,
        tripId as string
      );
      this.sendSuccess(res, { status }, 'Connection status fetched successfully');
    }
  );

  getTripMembers = asyncHandler(async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const members = await this._connectionService.getTripMembers(tripId);
    this.sendSuccess(res, members, 'Trip members fetched successfully');
  });
}
