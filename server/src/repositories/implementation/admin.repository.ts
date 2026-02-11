// backend/src/repositories/admin.repository.ts
import UserModel from '../../models/user.models.js';
 import GuideProfile from '../../models/guide.model.js';
import { IUser } from '../../types/user.type.js';
import { IAdminRepository } from '../interface/IAdminRepository.js';
import { Guide } from '../../types/guide.type.js';
import { BaseRepository } from './base.repository.js';

export class AdminRepository  implements IAdminRepository{

async getAllUsers(page: number, limit: number, search: string) {
  page=Math.max(1,page);
  limit=Math.max(1,limit);
  const skip = (page - 1) * limit;
  
  const query = search 
    ? { 
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      } 
    : {};

  // Execute count and find in parallel for better performance
  const [users, totalUsers] = await Promise.all([
    UserModel.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    UserModel.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users,
    totalPages,
    currentPage: page,
    totalUsers
  };
}

  
  async findUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).select('-password');
  }

  
  async updateUserBlockStatus(id: string, isBlocked: boolean): Promise<IUser | null> {
    console.log('id',id);
    return await UserModel.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    ).select('-password');
  }
  async deleteUser(id: string): Promise<boolean> {
    console.log('from adminrepo',id);
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

//guide
  async getAllPendingGuides():Promise<Guide[]> {
  return await GuideProfile.find({isVerified:false})
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .lean<Guide[]>();

}
async getAllGuides(page:number,limit:number,search:string) {
  const skip=(Math.max(1,page)-1)*limit;
  const query=search?{
    $or:[
      {serviceArea:{$regex:search,$options:'i'}},
      {bio:{$regex:search,$options:"i"}}
    ]
  }:{};
  const [guides,totalGuides]=await Promise.all([
    GuideProfile.find(query)
    .populate('userId','name email role isBlocked')
    .skip(skip)
    .limit(limit)
    .lean<Guide[]>(),
    GuideProfile.countDocuments(query)
  ])
  return {
    guides,
    totalPages: Math.ceil(totalGuides / limit),
    totalGuides,
    currentPage: page
  };
}
async verifyGuide(guideId: string): Promise<Guide|null> {
    return await GuideProfile.findByIdAndUpdate(
      guideId, 
      { isVerified: true }, 
      { new: true }
    ).lean<Guide>();
  }
  async deleteGuide(id: string):Promise<Guide|null> {
  return await GuideProfile.findByIdAndDelete(id).lean<Guide>();
}

async updateUserRole(userId:string,role:'user'|'guide'|'admin'):Promise<IUser|null>{
  return await UserModel.findByIdAndUpdate(userId,{role},{new:true}).lean();
}

}