// backend/src/middleware/adminAuth.ts
import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log("from adminauth")
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};