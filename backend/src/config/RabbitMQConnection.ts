import amqp, { type Channel, type ChannelModel } from "amqplib";
import { env } from "./env";
import { logger } from "../utils/logger";

const EXCHANGE_NAME = "creatorlane.events";
const MAX_RETRIES = 5;

export class RabbitMQConnection {
  private static instance: RabbitMQConnection;
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  private constructor() {}

  static getInstance(): RabbitMQConnection {
    if (!RabbitMQConnection.instance) {
      RabbitMQConnection.instance = new RabbitMQConnection();
    }
    return RabbitMQConnection.instance;
  }

  async connect(): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const conn = await amqp.connect(env.RABBITMQ_URL);
        const ch = await conn.createChannel();
        await ch.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

        conn.on("error", (error: Error) => {
          logger.error("RabbitMQ connection error", { error });
        });
        ch.on("error", (error: Error) => {
          logger.error("RabbitMQ channel error", { error });
        });

        this.connection = conn;
        this.channel = ch;
        logger.info("RabbitMQ connected");
        return;
      } catch (error) {
        const delayMs = 2 ** (attempt - 1) * 1000;
        logger.error(`RabbitMQ connection attempt ${attempt} failed`, { error });
        if (attempt === MAX_RETRIES) throw error;
        await this.sleep(delayMs);
      }
    }
  }

  getChannel(): Channel | null {
    return this.channel;
  }

  getExchangeName(): string {
    return EXCHANGE_NAME;
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
    logger.info("RabbitMQ connection closed");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
