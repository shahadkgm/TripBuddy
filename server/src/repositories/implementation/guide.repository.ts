import { IGuideRepository } from "../interface/IGuideRepository.js";
import { IGuideProfile } from "../../domain/entities/GuideProfile.js";
import GuideProfile from "../../models/guide.model.js";

export class GuideRepository implements IGuideRepository {
  async findAll(filters: Record<string, any>): Promise<IGuideProfile[]> {
    return await GuideProfile.find(filters)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean()
      .exec() as IGuideProfile[];
  }

  async findByUserId(userId: string): Promise<IGuideProfile | null> {
    return await GuideProfile.findOne({ userId })
      .lean()
      .exec() as IGuideProfile | null;
  }

  async create(data: Partial<IGuideProfile>): Promise<IGuideProfile> {
    const saved = await new GuideProfile(data).save();
    return saved.toObject() as IGuideProfile;
  }
}
