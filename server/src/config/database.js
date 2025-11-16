import mongoose from "mongoose";
import logger from "../utils/logger.js";

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    const mongoUri =
      process.env.NODE_ENV === "test"
        ? process.env.MONGODB_TEST_URI
        : process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MongoDB URI not configured");
    }

    logger.info(
      { mongoUri: mongoUri.replace(/:[^:]*@/, ":****@") },
      "Connecting to MongoDB"
    );

    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info("MongoDB connected successfully");

    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection lost");
    });

    mongoose.connection.on("error", (error) => {
      logger.error({ error }, "MongoDB connection error");
    });
  } catch (error) {
    logger.error({ error }, "Failed to connect to MongoDB");
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  } catch (error) {
    logger.error({ error }, "Error disconnecting from MongoDB");
    throw error;
  }
};
