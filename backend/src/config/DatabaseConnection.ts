import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

const MAX_RETRIES = 5;

export class DatabaseConnection {
  private static instance: DatabaseConnection;

  private constructor() {
    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connection established");
    });
    mongoose.connection.on("error", (error: Error) => {
      logger.error("MongoDB connection error", { error });
    });
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
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
        if (attempt === MAX_RETRIES) throw error;
        await this.sleep(delayMs);
      }
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  }

  isConnected(): boolean {
    return mongoose.connection.readyState !== 0;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
