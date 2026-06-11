import type { ConsumeMessage } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import { BID_EXCHANGE_NAME, BidEvent } from "../config/config.constants";
import type { EscrowService } from "../modules/escrow/EscrowService";
import { ConflictError } from "../core/errors/ConflictError";
import { ServiceUnavailableError } from "../core/errors/ServiceUnavailableError";
import { logger } from "../utils/logger";
import { BaseWorker } from "./BaseWorker";

export class EscrowInitWorker extends BaseWorker {
  protected readonly queueName = "creatorlane.bid.escrow";
  protected readonly exchangeName = BID_EXCHANGE_NAME;
  protected readonly routingKey = BidEvent.Accepted;
  protected readonly prefetch = 5;

  constructor(
    rabbitMQ: RabbitMQConnection,
    private readonly escrowService: EscrowService,
  ) {
    super(rabbitMQ);
  }

  protected async handleMessage(msg: ConsumeMessage): Promise<void> {
    const channel = this.channel;
    if (!channel) return;

    let bidId: string | undefined;
    try {
      const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
      logger.info("EscrowInitWorker: received message", { payload });
      bidId = typeof payload["bidId"] === "string" ? payload["bidId"] : undefined;
      if (!bidId) {
        logger.warn("EscrowInitWorker: message missing bidId, discarding", { payload });
        channel.ack(msg);
        return;
      }

      await this.escrowService.initEscrow(bidId);
      channel.ack(msg);
    } catch (err) {
      logger.error("EscrowInitWorker: error processing message", { bidId, err });
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
