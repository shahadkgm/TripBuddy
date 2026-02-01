import { Request, Response, NextFunction } from 'express';

export interface IAdminController {
  // User Management
  getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
  handleBlockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;

  // Guide Management
  getPendingGuides(req: Request, res: Response, next: NextFunction): Promise<void>;
  handleVerifyGuide(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllGuides(req: Request, res: Response, next: NextFunction): Promise<void>;
  rejectGuide(req: Request, res: Response, next: NextFunction): Promise<void>;
}