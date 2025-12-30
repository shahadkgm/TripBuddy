// backend/src/instances.ts
// import { GuideRepository } from './repositeries/guide.repository.js';
import { GuideRepository } from './repositories/guide.repository.js';
import { GuideService } from './services/guide.service.js';

// 1. Create the low-level repository
const guideRepository = new GuideRepository();

// 2. Inject it into the high-level service (Dependency Inversion)
export const guideService = new GuideService(guideRepository);