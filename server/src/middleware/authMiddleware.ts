// backend/src/middleware/authMiddleware.ts
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { StatusCode } from '../constants/statusCode.enum';
// import UserModel from '../models/user.models';
import { AuthRequest } from '../types/authRequest';
import { UserModel } from '../models/user.models';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: 'no token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      console.log('Rejecting auth: User not found in DB for ID', decoded.id);
      return res.status(StatusCode.UNAUTHORIZED).json({ message: 'User not found' });
    }
    if (user.isBlocked) {
      console.log('Rejecting auth: User blocked', user.email);
      return res.status(StatusCode.FORBIDDEN).json({ message: 'User blocked' });
    }
    if (!user.isVerified) {
      console.log('Rejecting auth: User not verified', user.email);
      return res.status(StatusCode.FORBIDDEN).json({ message: 'Please verify your email first' });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email
    };
    next();
  } catch (error) {
    console.error('Auth middleware token verification failed:', error);
    res.status(StatusCode.UNAUTHORIZED).json({ message: 'Token invalid or expired' });
  }
};

// Admin only middleware
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(StatusCode.FORBIDDEN).json({ message: 'Access denied. Admins only.' });
  }
};