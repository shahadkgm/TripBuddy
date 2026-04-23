import { Response } from 'express';
import { IGuideInvitationService } from '../../services/interface/IGuideInvitationService';
import { InvitationStatus } from '../../types/guideInvitation.type';
import { AuthRequest } from '../../types/authRequest';
import { asyncHandler } from '../../utils/asyncHandler';
import { BaseController } from './base.controller';

export class GuideInvitationController extends BaseController {
  constructor(private _invitationService: IGuideInvitationService) {
    super();
  }

  sendInvitation = asyncHandler(
    async (req: AuthRequest<{}, {}, { tripId: string; guideId: string }>, res: Response) => {
      const { tripId, guideId } = req.body;
      const senderId = req.user?.id as string;

      const invitation = await this._invitationService.sendInvitation(tripId, guideId, senderId);
      this.sendCreated(res, invitation, 'Invitation sent successfully');
    }
  );

  getInboundInvitations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const guideUserId = req.user?.id as string;
    console.log('--- GET INBOUND INVITATIONS HIT ---', { guideUserId });
    const invitations = await this._invitationService.getGuideInvitations(guideUserId);
    this.sendSuccess(res, invitations, 'Inbound invitations fetched successfully');
  });

  respondToInvitation = asyncHandler(
    async (
      req: AuthRequest<{}, {}, { invitationId: string; status: string; reason?: string }>,
      res: Response
    ) => {
      const { invitationId, status, reason } = req.body;
      const guideUserId = req.user?.id as string;

      if (![InvitationStatus.ACCEPTED, InvitationStatus.REJECTED].includes(status as InvitationStatus)) {
        this.sendBadRequest(res, 'Invalid status');
        return;
      }

      const invitation = await this._invitationService.respondToInvitation(
        invitationId,
        status,
        guideUserId,
        reason
      );
      this.sendSuccess(res, invitation, `Invitation ${status.toLowerCase()} successfully`);
    }
  );

  getOutboundInvitations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const organizerId = req.user?.id as string;
    const invitations = await this._invitationService.getOutboundInvitations(organizerId);
    this.sendSuccess(res, invitations, 'Outbound invitations fetched successfully');
  });
}
