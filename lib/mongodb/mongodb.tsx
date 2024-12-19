import mongoose from "mongoose";

const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(process.env.MONGODB_URI as string);
};

export default connectToDatabase;