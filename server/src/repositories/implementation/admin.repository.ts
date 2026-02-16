import GuideProfile from '../../models/guide.model';
import { IUser } from '../../types/user.type';
import { CreateUserDTO } from '../../dto/user.dto';
import { IAdminRepository } from '../interface/IAdminRepository';
import { UserModel } from '../../models/user.models';
import { logger } from '../../utils/logger';
import { BaseRepository } from './base.repository';
import { IGuide } from '../../types/guide.type';

export class AdminRepository extends BaseRepository<IUser, CreateUserDTO> implements IAdminRepository {

  constructor() {
    super(UserModel);
  }


  async getAllUsers(page: number, limit: number, search: string) {

    page = Math.max(1, page);
    limit = Math.max(1, limit);
    const skip = (page - 1) * limit;
    const query = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
      : {};

    const [users, totalUsers] = await Promise.all([
      UserModel.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query)
    ]);
    logger.debug(`users from debug${users}`);
    logger.info('the user gett all in getall user admin ');

    const formattedUsers = users as IUser[];
    // logger.debug("from repo",f)
    return {
      users: formattedUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers
    };
  }



  async findUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).select('-password');
  }


  async updateUserBlockStatus(id: string, isBlocked: boolean): Promise<IUser | null> {
    console.log('id', id);
    return await UserModel.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    ).select('-password');
  }
  async deleteUser(id: string): Promise<boolean> {
    console.log('from adminrepo', id);
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  //guide
  async getAllPendingGuides(): Promise<IGuide[]> {
    return await GuideProfile.find({ isVerified: false })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .lean<IGuide[]>();

  }
  async getAllGuides(page: number, limit: number, search: string) {
    const skip = (Math.max(1, page) - 1) * limit;
    const query = search ? {
      $or: [
        { serviceArea: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ]
    } : {};
    const [guides, totalGuides] = await Promise.all([
      GuideProfile.find(query)
        .populate('userId', 'name email role isBlocked')
        .skip(skip)
        .limit(limit)
        .lean<IGuide[]>(),
      GuideProfile.countDocuments(query)
    ]);
    // logger.info(`from a-repo,f-guide ${JSON.stringify(guides)}`)
    return {
      guides,
      totalPages: Math.ceil(totalGuides / limit),
      totalGuides,
      currentPage: page
    };
  }
  async verifyGuide(guideId: string): Promise<IGuide | null> {
    return await GuideProfile.findByIdAndUpdate(
      guideId,
      { isVerified: true },
      { new: true }
    ).lean<IGuide>();
  }
  async deleteGuide(id: string): Promise<IGuide | null> {
    await GuideProfile.deleteMany({ userId: id });
    return await GuideProfile.findByIdAndDelete(id).lean<IGuide>();
  }

  async updateUserRole(userId: string, role: 'user' | 'guide' | 'admin'): Promise<IUser | null> {
    const user = await UserModel.findByIdAndUpdate(userId, { role }, { new: true }).lean<IUser>();
    logger.info(`from updateusermodel ,a-repository ${user}`);
    logger.debug(`from updateusermodal${user}`);
    return user ?? null;
  }

}