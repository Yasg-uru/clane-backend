import type { Channel, ConsumeMessage } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { NotificationRepository } from "../infrastructure/repositories/NotificationRepository";
import type { EscrowService } from "../modules/escrow/EscrowService";
import { ConflictError } from "../core/errors/ConflictError";
import { ESCROW_EXCHANGE_NAME } from "../config/config.constants";
import { logger } from "../utils/logger";

const QUEUE_NAME = "creatorlane.escrow.funded";
const ROUTING_KEY = "escrow.funded";
const PREFETCH = 10;

export class EscrowFundedWorker {
  private channel: Channel | null = null;
  private consumerTag: string | null = null;

  constructor(
    private readonly escrowService: EscrowService,
    private readonly notificationRepository: NotificationRepository,
    private readonly rabbitMQ: RabbitMQConnection,
  ) {}

  async start(): Promise<void> {
    this.channel = await this.rabbitMQ.createChannel();
    await this.channel.assertExchange(ESCROW_EXCHANGE_NAME, "topic", { durable: true });
    await this.channel.assertQueue(QUEUE_NAME, { durable: true });
    await this.channel.bindQueue(QUEUE_NAME, ESCROW_EXCHANGE_NAME, ROUTING_KEY);
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
    logger.info("EscrowFundedWorker started");
  }

  async stop(): Promise<void> {
    if (this.channel && this.consumerTag) {
      await this.channel.cancel(this.consumerTag);
    }
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    logger.info("EscrowFundedWorker stopped");
  }

  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    const channel = this.channel;
    if (!channel) return;

    let escrowId: string | undefined;
    try {
      const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
      escrowId = typeof payload["escrowId"] === "string" ? payload["escrowId"] : undefined;
      const brandId = typeof payload["brandId"] === "string" ? payload["brandId"] : "";
      const creatorId = typeof payload["creatorId"] === "string" ? payload["creatorId"] : "";
      const campaignId = typeof payload["campaignId"] === "string" ? payload["campaignId"] : "";
      const bidId = typeof payload["bidId"] === "string" ? payload["bidId"] : "";

      if (!escrowId) {
        logger.warn("EscrowFundedWorker: message missing escrowId, discarding", { payload });
        channel.ack(msg);
        return;
      }

      const room = await this.escrowService.createCollabRoom(escrowId);
      const collabRoomId = room._id.toString();
      const agreedAmountPaise = Number(payload["agreedAmount"] ?? 0);
      const agreedAmountRupees = Math.round(agreedAmountPaise / 100);

      await Promise.all([
        this.notificationRepository.createNotification({
          recipientId: creatorId,
          recipientRole: "creator",
          type: "escrow.funded",
          title: "Funds secured",
          body: `₹${agreedAmountRupees.toLocaleString("en-IN")} has been held in escrow. Your collaboration room is ready.`,
          meta: { collabRoomId, escrowId, campaignId, bidId, agreedAmount: agreedAmountPaise },
        }),
        this.notificationRepository.createNotification({
          recipientId: brandId,
          recipientRole: "brand",
          type: "collab.room_ready",
          title: "Collaboration room ready",
          body: "Your collab room is live. Message the creator to get started.",
          meta: { collabRoomId, escrowId, campaignId, bidId },
        }),
        this.notificationRepository.createNotification({
          recipientId: creatorId,
          recipientRole: "creator",
          type: "collab.room_ready",
          title: "Collaboration room ready",
          body: "Your collab room is live. The brand is waiting.",
          meta: { collabRoomId, escrowId, campaignId, bidId },
        }),
      ]);

      channel.ack(msg);
    } catch (err) {
      if (err instanceof ConflictError) {
        logger.debug("EscrowFundedWorker: collab room already exists", { escrowId });
        channel.ack(msg);
        return;
      }
      logger.error("EscrowFundedWorker: unexpected error, requeuing", { escrowId, err });
      channel.nack(msg, false, true);
    }
  }
}
