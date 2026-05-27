import type { Channel } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import { BID_EXCHANGE_NAME } from "../config/config.constants";
import { logger } from "../utils/logger";

const QUEUE_NAME = "creatorlane.bid.escrow";
const ROUTING_KEY = "bid.accepted";

export class EscrowInitWorker {
  private channel: Channel | null = null;
  private consumerTag: string | null = null;

  constructor(private readonly rabbitMQ: RabbitMQConnection) {}

  async start(): Promise<void> {
    this.channel = await this.rabbitMQ.createChannel();
    await this.channel.assertExchange(BID_EXCHANGE_NAME, "topic", { durable: true });
    await this.channel.assertQueue(QUEUE_NAME, { durable: true });
    await this.channel.bindQueue(QUEUE_NAME, BID_EXCHANGE_NAME, ROUTING_KEY);
    this.channel.prefetch(10);

    const { consumerTag } = await this.channel.consume(
      QUEUE_NAME,
      (msg) => {
        if (!msg) return;

        try {
          const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
          const bidId = payload["bidId"];
          logger.info("EscrowInitWorker: escrow init queued", { bidId });
          this.channel?.ack(msg);
        } catch (err) {
          logger.error("EscrowInitWorker: failed to process message", { err });
          this.channel?.ack(msg);
        }
      },
      { noAck: false },
    );

    this.consumerTag = consumerTag;
    logger.info("EscrowInitWorker started");
  }

  async stop(): Promise<void> {
    if (this.channel && this.consumerTag) {
      await this.channel.cancel(this.consumerTag);
    }
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    logger.info("EscrowInitWorker stopped");
  }
}
