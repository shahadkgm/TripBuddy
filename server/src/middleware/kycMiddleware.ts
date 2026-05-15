import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/authRequest';
import { UserModel } from '../models/user.models';
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

  const user = await UserModel.findById(userId).select('kyc');

  if (!user) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: 'User not found' });
  }

  if (user.kyc?.status !== 'approved') {
    return res.status(StatusCode.FORBIDDEN).json({
      message: 'KYC verification required. Please complete your identity verification to access this feature.',
      kycStatus: user.kyc?.status || 'none',
    });
  }

  next();
};
