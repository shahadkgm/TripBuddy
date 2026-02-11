import { IUser } from '../types/user.type';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
