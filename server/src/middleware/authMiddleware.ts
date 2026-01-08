// backend/src/middleware/authMiddleware.ts
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { StatusCode } from "../constants/statusCode.enum.js"; // Use your enum
import UserModel from '../models/user.models.js';

export const protect = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer') ? authHeader.split(" ")[1] : null;
console.log("user from token",req.user)
  if (!token) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "fallback");
    
    const user= await UserModel.findById(decoded.id||decoded._id);
     
    if(!user||user.isBlocked){
      return res.status(StatusCode.UNAUTHORIZED).json({message:"user is blocked or no longer exit"})
    }


    // Ensure the decoded object matches what the controller expects (req.user.id)
    req.user = {
      id: decoded.id || decoded._id,
      role: decoded.role
    }; 
    next();
  } catch (error) {
    res.status(StatusCode.UNAUTHORIZED).json({ message: "Token invalid or expired" });
  }
};

// Admin only middleware
export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};