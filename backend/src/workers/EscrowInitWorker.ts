import type { Channel } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import { BID_EXCHANGE_NAME } from "../config/config.constants";
import type { EscrowService } from "../modules/escrow/EscrowService";
import { ConflictError } from "../core/errors/ConflictError";
import { ServiceUnavailableError } from "../core/errors/ServiceUnavailableError";
import { logger } from "../utils/logger";

const QUEUE_NAME = "creatorlane.bid.escrow";
const ROUTING_KEY = "bid.accepted";
const PREFETCH = 5;

export class EscrowInitWorker {
  private channel: Channel | null = null;
  private consumerTag: string | null = null;

  constructor(
    private readonly rabbitMQ: RabbitMQConnection,
    private readonly escrowService: EscrowService,
  ) {}

  async start(): Promise<void> {
    this.channel = await this.rabbitMQ.createChannel();
    await this.channel.assertExchange(BID_EXCHANGE_NAME, "topic", { durable: true });
    await this.channel.assertQueue(QUEUE_NAME, { durable: true });
    await this.channel.bindQueue(QUEUE_NAME, BID_EXCHANGE_NAME, ROUTING_KEY);
    this.channel.prefetch(PREFETCH);

    const { consumerTag } = await this.channel.consume(
      QUEUE_NAME,
      (msg) => {
        if (!msg) return;
        void this.handleMessage(msg);
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

  private async handleMessage(msg: import("amqplib").ConsumeMessage): Promise<void> {
    const channel = this.channel;
    if (!channel) return;

    let bidId: string | undefined;
    try {
      const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
      bidId = typeof payload["bidId"] === "string" ? payload["bidId"] : undefined;
      if (!bidId) {
        logger.warn("EscrowInitWorker: message missing bidId, discarding", { payload });
        channel.ack(msg);
        return;
      }

      await this.escrowService.initEscrow(bidId);
      channel.ack(msg);
    } catch (err) {
      if (err instanceof ConflictError) {
        logger.debug("EscrowInitWorker: escrow already exists for bid", { bidId });
        channel.ack(msg);
        return;
      }
      if (err instanceof ServiceUnavailableError) {
        logger.error("EscrowInitWorker: Razorpay unavailable, requeuing", { bidId, err });
        channel.nack(msg, false, true);
        return;
      }
      logger.error("EscrowInitWorker: unexpected error, requeuing", { bidId, err });
      channel.nack(msg, false, true);
    }
  }
}
