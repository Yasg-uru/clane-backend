import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

const MAX_RETRIES = 5;

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established");
});

mongoose.connection.on("error", (error: Error) => {
  logger.error("MongoDB connection error", { error });
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const connectDB = async (): Promise<void> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info("MongoDB connected");
      return;
    } catch (error) {
      const delayMs = 2 ** (attempt - 1) * 1000;
      logger.error(`MongoDB connection attempt ${attempt} failed`, { error });

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      await sleep(delayMs);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed");
};
