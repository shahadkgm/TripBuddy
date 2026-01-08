// src/services/interfaces/IGuideService.ts
export interface IGuideService {
  register(userId: string, data: any, file?: string): Promise<any>;
  getStatus(userId: string): Promise<any>;
  getAllVerifiedGuides(query: any): Promise<any>;
}
