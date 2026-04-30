import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import guideProfileModel from '../server/src/models/guide.model';
import { ReviewModel } from '../server/src/models/review.model';

dotenv.config();

async function migrate() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tripbuddy';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const guides = await guideProfileModel.find({});
  console.log(`Found ${guides.length} guides to update`);

  for (const guide of guides) {
    const stats = await ReviewModel.aggregate([
      { $match: { guideId: guide._id } },
      {
        $group: {
          _id: '$guideId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await guideProfileModel.findByIdAndUpdate(guide._id, {
        averageRating: stats[0].averageRating,
        reviewCount: stats[0].reviewCount,
      });
      console.log(`Updated guide ${guide.name}: ${stats[0].averageRating} (${stats[0].reviewCount})`);
    } else {
      await guideProfileModel.findByIdAndUpdate(guide._id, {
        averageRating: 0,
        reviewCount: 0,
      });
      console.log(`Reset guide ${guide.name} to 0`);
    }
  }

  await mongoose.disconnect();
  console.log('Migration completed');
}

migrate().catch(console.error);
