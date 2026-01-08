import mongoose from 'mongoose';


export const connectDB = async (): Promise<void> => {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error("FATAL ERROR: MONGO_URI is not defined.");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected Successfully!');
    } catch (error) {
        
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};
