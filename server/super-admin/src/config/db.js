import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";

const scrubUri = (uri) => {
  if (!uri) return uri;
  return uri.replace(/:\S+@/, ":****@");
};

export const connectDB = async () => {
  try {
    logger.info({ uri: scrubUri(env.db.uri) }, "Super admin DB connecting");
    await mongoose.connect(env.db.uri, {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("Super admin DB connected");
  } catch (error) {
    logger.error({ error }, "Super admin DB connection failed");
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("Super admin DB disconnected");
  } catch (error) {
    logger.error({ error }, "Super admin DB disconnect error");
  }
};
