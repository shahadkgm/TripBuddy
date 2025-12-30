// backend/src/repositories/guide.repository.ts
import { IGuideRepository, IGuideProfile } from "../interfaces/IGuideInterface.js";
import GuideProfile from "../models/guide.model.js";

export class GuideRepository implements IGuideRepository {
  
  async findAll(filters: Record<string, any>): Promise<IGuideProfile[]> {
    return await GuideProfile.find(filters)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 }) 
      .lean() 
      .exec() as unknown as IGuideProfile[];
  }

  
  async findByUserId(userId: string): Promise<IGuideProfile | null> {
    return await GuideProfile.findOne({ userId })
      .lean()
      .exec() as unknown as IGuideProfile | null;
  }

  /**
   * SOLID: Persistence logic
   */
 async create(data: Partial<IGuideProfile>): Promise<IGuideProfile> {
    const newProfile = new GuideProfile({
      ...data,
      lastUpdated: new Date() // Manually satisfying the missing property
    });

    // Use a type assertion to tell TS this matches the clean Interface
    const saved = await newProfile.save();
    return saved as unknown as IGuideProfile; 
  }
}