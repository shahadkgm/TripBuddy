// backend/src/middleware/authMiddleware.ts
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { StatusCode } from "../constants/statusCode.enum.js"; // Use your enum
import UserModel from '../models/user.models.js';
import { AuthRequest } from '../types/authrequst.js';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if(!authHeader||!authHeader.startsWith("Bearer ")){
    return res.status(StatusCode.UNAUTHORIZED).json({message:"no token provided"})
  }
  const token =  authHeader.split(" ")[1] ;
console.log("user from token",req.user)
  if (!token) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)as{
      id:string;
      role:string;
    };
    
    const user= await UserModel.findById(decoded.id);
     
    // if(!user||user.isBlocked){
    //   return res.status(StatusCode.UNAUTHORIZED).json({message:"user is blocked or no longer exit"})
    // }
    if(!user){
      return res.status(StatusCode.UNAUTHORIZED).json({message:"User not found"})
    }
    if(user.isBlocked){
      return res.status(StatusCode.FORBIDDEN).json({messaage:"User blocked"})
    }

console.log("req.user from authMiddleware server",req.user)
    // Ensure the decoded object matches what the controller expects (req.user.id)
    req.user = {
     _id: user._id.toString() ,
      role: user.role,
      email:user.email
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