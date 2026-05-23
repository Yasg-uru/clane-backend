import amqp, { type Channel, type ChannelModel } from "amqplib";
import { env } from "./env";
import { logger } from "../utils/logger";

const EXCHANGE_NAME = "creatorlane.events";
const MAX_RETRIES = 5;

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const connectRabbitMQ = async (): Promise<void> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const rabbitConnection = await amqp.connect(env.RABBITMQ_URL);
      const rabbitChannel = await rabbitConnection.createChannel();
      await rabbitChannel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

      rabbitConnection.on("error", (error: Error) => {
        logger.error("RabbitMQ connection error", { error });
      });

      rabbitChannel.on("error", (error: Error) => {
        logger.error("RabbitMQ channel error", { error });
      });

      connection = rabbitConnection;
      channel = rabbitChannel;
      logger.info("RabbitMQ connected");
      return;
    } catch (error) {
      const delayMs = 2 ** (attempt - 1) * 1000;
      logger.error(`RabbitMQ connection attempt ${attempt} failed`, { error });

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      await sleep(delayMs);
    }
  }
};

export const publishEvent = (
  routingKey: string,
  payload: object,
): boolean => {
  if (!channel) {
    // [HIGH] Do not throw — registration must succeed even when broker is temporarily down.
    logger.warn("RabbitMQ channel not ready, skipping event", { routingKey });
    return false;
  }

  return channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(payload)),
    {
      contentType: "application/json",
      persistent: true,
    },
  );
};

export const closeRabbitMQ = async (): Promise<void> => {
  if (channel) {
    await channel.close();
    channel = null;
  }

  if (connection) {
    await connection.close();
    connection = null;
  }

  logger.info("RabbitMQ connection closed");
};
