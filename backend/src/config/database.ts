import mongoose from "mongoose";


const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medikiosk";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✓ MongoDB connected: ${MONGODB_URI}`);
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error);
    throw error;
  }
};

mongoose.connection.on("connected", () => {
  console.log("✓ MongoDB connected successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("✗ MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠ MongoDB disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  process.exit(0);
});
