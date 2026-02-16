// backend/src/middleware/adminAuth.ts
import {  Response, NextFunction } from 'express';
import { AuthRequest } from '../types/authrequst';

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log('from adminauth');
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};