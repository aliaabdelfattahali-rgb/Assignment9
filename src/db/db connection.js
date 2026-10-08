import mongoose from "mongoose";

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is missing in config/.env");
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

export default connectDB;
