import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/authRequest';
import { UserModel } from '../models/user.models';
import { KYC } from '../models/kyc.model';
import { StatusCode } from '../constants/statusCode.enum';

/**
 * Middleware to enforce KYC approval before accessing protected actions.
 * Must be used AFTER the `protect` middleware so that `req.user` is already set.
 */
export const requireKyc = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: 'Not authenticated' });
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: 'User not found' });
  }

  // Admin and guides bypass regular KYC verification (guides are verified separately)
  if (user.role === 'admin' || user.role === 'guide') {
    return next();
  }

  // Look up latest KYC record in the KYC collection
  const latestKyc = await KYC.findOne({ userId }).sort({ uploadedAt: -1 });

  if (!latestKyc || latestKyc.status !== 'approved') {
    return res.status(StatusCode.FORBIDDEN).json({
      message: 'KYC verification required. Please complete your identity verification to access this feature.',
      kycStatus: latestKyc?.status || 'none',
    });
  }

  next();
};
