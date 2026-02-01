// backend/src/repositories/admin.repository.ts
import UserModel from "../../models/user.models.js";
 import GuideProfile from "../../models/guide.model.js";
import { IUser } from "../../types/user.type.js";
import { IGuideProfile } from "../../domain/entities/GuideProfile.js";
import { IAdminRepository } from "../interface/IAdminRepository.js";

export class AdminRepository implements IAdminRepository{
  // backend/src/repositories/admin.repository.ts

async getAllUsers(page: number, limit: number, search: string) {
  page=Math.max(1,page)
  limit=Math.max(1,limit)
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
    return await UserModel.findById(id).select("-password");
  }

  
  async updateUserBlockStatus(id: string, isBlocked: boolean): Promise<IUser | null> {
    console.log("id",id)
    return await UserModel.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    ).select("-password");
  }
  async deleteUser(id: string): Promise<boolean> {
    console.log("from adminrepo",id)
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

//guide
  async getAllPendingGuides():Promise<IGuideProfile[]> {
  return await GuideProfile.find()
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .lean();

}
async getAllGuides():Promise<IGuideProfile[]> {
  return await GuideProfile.find({})
    .populate('userId', 'name email role isBlocked')
    .sort({ createdAt: -1 })
    .lean()
}
async verifyGuide(guideId: string): Promise<IGuideProfile|null> {
    return await GuideProfile.findByIdAndUpdate(
      guideId, 
      { isVerified: true }, 
      { new: true }
    ).lean();
  }
  async deleteGuide(id: string):Promise<IGuideProfile|null> {
  return await GuideProfile.findByIdAndDelete(id).lean();
}

async updateUserRole(userId:string,role:"user"|"guide"|"admin"):Promise<IUser|null>{
  return await UserModel.findByIdAndUpdate(userId,{role},{new:true}).lean()
}

}