import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { seedUsers } from "./utils/seed";

import routes from "./routes";


const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medikiosk";

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(rateLimit);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MediKiosk Backend API is running",
    version: "1.0.0",
    mongoStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);


console.log(`Connecting to: ${MONGODB_URI.replace(/:[^:@]+@/, ":****@")}`);

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("✓ MongoDB connected successfully");

    await seedUsers();

    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`  MediKiosk v5 Backend Server`);
      console.log(`==================================================`);
      console.log(`  🌏  Port: ${PORT}`);
      console.log(`  🗄️  Database: MongoDB`);
      console.log(`  🔐  Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`  🌐  API Base: http://localhost:${PORT}/api`);
      console.log(`  💚  Health: http://localhost:${PORT}/health`);
      console.log(`==================================================`);
    });
  })
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err.message);
    console.log("⚠ Server will start but database operations will fail");
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`  MediKiosk v5 Backend Server (NO DB)`);
      console.log(`  Port: ${PORT}`);
      console.log(`  MongoDB Error: ${err.message}`);
      console.log(`==================================================`);
    });
  });

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully...");
  mongoose.disconnect().then(() => {
    console.log("✓ MongoDB disconnected");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received. Shutting down gracefully...");
  mongoose.disconnect().then(() => {
    console.log("✓ MongoDB disconnected");
    process.exit(0);
  });
});

export default app;
