// backend/src/repositories/admin.repository.ts
// import User from "../models/user.models.js";
import UserModel from "../../models/user.models.js";
 import GuideProfile from "../../models/guide.model.js";
import { IUser } from "../../types/user.type.js";

export class AdminRepository {
  // backend/src/repositories/admin.repository.ts

// Update the return type to handle pagination metadata
async getAllUsers(page: number, limit: number, search: string) {
  const skip = (page - 1) * limit;
  
  // Create a search filter for name or email (case-insensitive)
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
    return await UserModel.findById(id);
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
  async getAllPendingGuides() {
  return await GuideProfile.find()
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 });
}
async getAllGuides() {
  return await GuideProfile.find({})
    .populate('userId', 'name email role isBlocked')
    .sort({ createdAt: -1 });
}
async verifyGuide(guideId: string): Promise<any> {
    return await GuideProfile.findByIdAndUpdate(
      guideId, 
      { isVerified: true }, 
      { new: true }
    );
  }
  async deleteGuide(id: string) {
  return await GuideProfile.findByIdAndDelete(id);
}

}