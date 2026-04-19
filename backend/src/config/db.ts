import mongoose from 'mongoose';

let cached: Promise<typeof mongoose> | null = null;

const connectDB = async () => {
    // If already connected, skip
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    // Cache the connection promise so concurrent requests share it
    if (!cached) {
        cached = mongoose.connect(
            process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/careconnectpro',
            { bufferCommands: true }
        );
    }

    try {
        await cached;
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error: any) {
        cached = null; // Reset so next request retries
        console.error(`MongoDB connection error: ${error.message}`);
        throw error; // Let the route handler return a 500 instead of killing the process
    }
};

export default connectDB;
