import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (mongoose.connections && mongoose.connections[0]?.readyState) return;
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/thoda_support";
    await mongoose.connect(uri);
    console.log('MongoDB Connected to', uri);
  } catch (error) {
    console.error('MongoDB connection error:', error?.message || error);
  }
}

export default connectDB;