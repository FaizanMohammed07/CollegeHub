import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";

const scrubUri = (uri) => {
  if (!uri) return uri;
  return uri.replace(/:\S+@/, ":****@");
};

export const connectDB = async () => {
  const uri = env.nodeEnv === "test" ? env.db.testUri : env.db.uri;

  if (!uri) {
    throw new Error("MongoDB URI is not configured in environment variables");
  }

  try {
    if (env.db.debug) {
      mongoose.set("debug", true);
    }

    logger.info(
      { uri: scrubUri(uri), env: env.nodeEnv },
      "Connecting to MongoDB"
    );

    await mongoose.connect(uri, {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info("MongoDB connection established");

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

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  } catch (error) {
    logger.error({ error }, "Error disconnecting from MongoDB");
    throw error;
  }
};
