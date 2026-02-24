import { Request, Response } from 'express';
import { IConnectionService } from '../../services/interface/IConnectionService';
import { StatusCode } from '../../constants/statusCode.enum';
import { AuthRequest } from '../../types/authRequest';
import { asyncHandler } from '../../utils/asyncHandler';

export class ConnectionController {
    constructor(private _connectionService: IConnectionService) { }

    sendRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
        const senderId = req.user?.id;
        const { receiverId, tripId } = req.body;

        if (!senderId) {
            return res.status(StatusCode.UNAUTHORIZED).json({ message: 'User not authenticated' });
        }

        if (senderId === receiverId) {
            return res.status(StatusCode.BAD_REQUEST).json({ message: 'You cannot connect with yourself' });
        }

        const request = await this._connectionService.sendRequest(senderId, receiverId, tripId);
        res.status(StatusCode.CREATED).json(request);
    });

    acceptRequest = asyncHandler(async (req: Request, res: Response) => {
        const { requestId } = req.params;
        const updated = await this._connectionService.acceptRequest(requestId);
        res.status(StatusCode.OK).json(updated);
    });

    rejectRequest = asyncHandler(async (req: Request, res: Response) => {
        const { requestId } = req.params;
        const updated = await this._connectionService.rejectRequest(requestId);
        res.status(StatusCode.OK).json(updated);
    });

    getPendingRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(StatusCode.UNAUTHORIZED).json({ message: 'User not authenticated' });
        }
        const requests = await this._connectionService.getPendingRequests(userId);
        res.status(StatusCode.OK).json(requests);
    });

    getConnectionStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
        const senderId = req.user?.id;
        const { receiverId, tripId } = req.query;

        if (!senderId) {
            return res.status(StatusCode.UNAUTHORIZED).json({ message: 'User not authenticated' });
        }

        const status = await this._connectionService.getConnectionStatus(
            senderId,
            receiverId as string,
            tripId as string
        );
        res.status(StatusCode.OK).json({ status });
    });
}
