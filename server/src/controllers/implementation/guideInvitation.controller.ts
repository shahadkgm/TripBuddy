import { Request, Response } from 'express';
import { IGuideInvitationService } from '../../services/interface/IGuideInvitationService';
import { InvitationStatus } from '../../types/guideInvitation.type';

export class GuideInvitationController {
  constructor(private _invitationService: IGuideInvitationService) {}

  async sendInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { tripId, guideId } = req.body;
      const senderId = (req as any).user.id;

      const invitation = await this._invitationService.sendInvitation(tripId, guideId, senderId);
      res.status(201).json({ success: true, data: invitation });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getInboundInvitations(req: Request, res: Response): Promise<void> {
    try {
      const guideUserId = (req as any).user.id;
      console.log('--- GET INBOUND INVITATIONS HIT ---', { guideUserId });
      const invitations = await this._invitationService.getGuideInvitations(guideUserId);
      res.status(200).json({ success: true, data: invitations });
    } catch (err: any) {
      console.error('Error in getInboundInvitations:', err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async respondToInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { invitationId, status, reason } = req.body;
      const guideUserId = (req as any).user.id;

      if (![InvitationStatus.ACCEPTED, InvitationStatus.REJECTED].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status' });
        return;
      }

      const invitation = await this._invitationService.respondToInvitation(
        invitationId,
        status,
        guideUserId,
        reason
      );
      res.status(200).json({ success: true, data: invitation });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getOutboundInvitations(req: Request, res: Response): Promise<void> {
    try {
      const organizerId = (req as any).user.id;
      const invitations = await this._invitationService.getOutboundInvitations(organizerId);
      res.status(200).json({ success: true, data: invitations });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
