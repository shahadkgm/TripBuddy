// server/src/controllers/implementation/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCode } from '../../constants/statusCode.enum.js';
import { IAuthController } from '../interfaces/IAuthController.js';
import { IAuthService } from '../../services/interface/IAuthservice.js';
import jwt from 'jsonwebtoken';
import { access } from 'node:fs';

export class AuthController implements IAuthController {
  constructor(private readonly _authService: IAuthService) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
    const result = await this._authService.registerUser(req.body);
    res.status(StatusCode.CREATED).json(result);
  } catch (error: any) {
    if (error.message === 'USER_EXISTS') {
      res.status(StatusCode.CONFLICT).json({ message: 'User already exists' });
    } else if (error.message === 'EMAIL_NOT_VERIFIED') {
      res.status(StatusCode.OK).json({ message: 'Verification email resent. Please check your inbox.' });
    } else {
      next(error);
    }
  }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(StatusCode.BAD_REQUEST).json({ message: 'All fields are required' });
        return;
      }
      const result = await this._authService.loginUser({ email, password });
      console.log('it reached in login backend',result);
      res.cookie('refreshToken',result.tokens?.refreshToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      res.status(StatusCode.OK).json({
        message:result.message,
        accessToken: result.tokens?.accessToken,
        user:result.user
      });
    } catch (error: any) {
  if (error.message === 'INVALID_CREDENTIALS') {
    res.status(StatusCode.UNAUTHORIZED).json({
      message: 'Invalid email or password'
    });
    return;
  }

  if (error.message === 'EMAIL_NOT_VERIFIED') {
    res.status(StatusCode.FORBIDDEN).json({
      message: 'Please verify your email before logging in'
    });
    return;
  }

  next(error);
}

  };

  googleLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(StatusCode.BAD_REQUEST).json({ message: 'Google token is required' });
        return;
      }

      const result = await this._authService.googleLogin(token);
      res.cookie('refreshToken',result.tokens?.refreshToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:'none',
       maxAge: 7 * 24 * 60 * 60 * 1000
      });
      res.status(StatusCode.OK).json({
        message:result.message,
        accessToken:result.tokens?.accessToken,
        user:result.user
      });
    } catch (error: any) {
      next(error);
    }
  };
  verifyEmail=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try{
      const{token}=req.params;
      console.log('token from frontend',token);
      const result=await this._authService.verifyEmail(token);
      res.status(StatusCode.OK).json(result);
      
    }catch(err){
       next(err);
    }
  };
  refreshToken=(req:Request,res:Response)=>{
    try{
      const token=req.cookies.refreshToken;
      console.log('from controll refresh');
       if(!token){
        return res.status(StatusCode.UNAUTHORIZED).json({message:'No refresh token found'});
       }
       const decoded=jwt.verify(token,process.env.JWT_SECRET!)as any;
      const newAccessToken=jwt.sign(
        {id:decoded.id,role:decoded.role},
        process.env.JWT_SECRET!,
        {expiresIn:'15m'}
      );
    res.json({ accessToken: newAccessToken });
    }catch{
      res.status(StatusCode.UNAUTHORIZED).json({message:'Login again'});
    }
  };
}
