import { PipelineStage } from 'mongoose';
import GuideProfile from '../../models/guide.model';
import { IUser } from '../../types/user.type';
import { CreateUserDTO } from '../../dto/user.dto';
import { IAdminRepository } from '../interface/IAdminRepository';
import { UserModel } from '../../models/user.models';
import { KYC } from '../../models/kyc.model';
import { TripModel } from '../../models/trip.model';
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
      UserModel.aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'kycs',
            let: { userIdStr: { $toString: '$_id' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$userId', '$$userIdStr'] } } },
              { $sort: { uploadedAt: -1 } },
              { $limit: 1 }
            ],
            as: 'kycData'
          }
        },
        {
          $addFields: {
            kyc: { $arrayElemAt: ['$kycData', 0] }
          }
        },
        {
          $project: {
            password: 0,
            kycData: 0
          }
        }
      ]),
      UserModel.countDocuments(query)
    ]);

    logger.info('Fetched all users with KYC data in admin repository');

    return {
      users: users as IUser[],
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
    logger.info(`Starting cascading delete for user: ${id}`);

    // Perform cleanup in parallel
    const [userResult] = await Promise.all([
      UserModel.findByIdAndDelete(id),
      GuideProfile.deleteMany({ userId: id }),
      KYC.deleteMany({ userId: id }),
      // Also cleanup trips if they exist
      TripModel.deleteMany({ userId: id })
    ]);

    if (userResult) {
      logger.info(`Successfully deleted user ${id} and all associated data (Guide, KYC, Trips)`);
      return true;
    }

    logger.warn(`User ${id} not found for deletion`);
    return false;
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

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { serviceArea: { $regex: search, $options: 'i' } },
            { bio: { $regex: search, $options: 'i' } },
            { specialties: { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
            { 'user.name': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    console.log(`Search Request - Term: "${search}", Skip: ${skip}, Limit: ${limit}`);

    const [guides, totalResults] = await Promise.all([
      GuideProfile.aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            userId: '$user',
            name: 1,
            bio: 1,
            hourlyRate: 1,
            serviceArea: 1,
            certificateUrl: 1,
            yearsOfExperience: 1,
            avatarURL: 1,
            specialties: 1,
            isVerified: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]),
      GuideProfile.aggregate([
        ...pipeline,
        { $count: 'count' }
      ])
    ]);

    const totalGuides = totalResults.length > 0 ? totalResults[0].count : 0;
    console.log(`Search Results - Found: ${totalGuides} total, Current Page: ${guides.length}`);

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

  async countVerifiedGuides(): Promise<number> {
    logger.info('from countverifiedGuide');
    return await UserModel.countDocuments({ role: 'guide' });
  }

}