import type { ConsumeMessage } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { NotificationRepository } from "../infrastructure/repositories/NotificationRepository";
import type { EscrowService } from "../modules/escrow/EscrowService";
import { ConflictError } from "../core/errors/ConflictError";
import { ESCROW_EXCHANGE_NAME } from "../config/config.constants";
import { logger } from "../utils/logger";
import { UserRole } from "../core/types";
import { BaseWorker } from "./BaseWorker";

export class EscrowFundedWorker extends BaseWorker {
  protected readonly queueName = "creatorlane.escrow.funded";
  protected readonly exchangeName = ESCROW_EXCHANGE_NAME;
  protected readonly routingKey = "escrow.funded";
  protected readonly prefetch = 10;

  constructor(
    private readonly escrowService: EscrowService,
    private readonly notificationRepository: NotificationRepository,
    rabbitMQ: RabbitMQConnection,
  ) {
    super(rabbitMQ);
  }

  protected async handleMessage(msg: ConsumeMessage): Promise<void> {
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
          recipientRole: UserRole.Creator,
          type: "escrow.funded",
          title: "Funds secured",
          body: `₹${agreedAmountRupees.toLocaleString("en-IN")} has been held in escrow. Your collaboration room is ready.`,
          meta: { collabRoomId, escrowId, campaignId, bidId, agreedAmount: agreedAmountPaise },
        }),
        this.notificationRepository.createNotification({
          recipientId: brandId,
          recipientRole: UserRole.Brand,
          type: "collab.room_ready",
          title: "Collaboration room ready",
          body: "Your collab room is live. Message the creator to get started.",
          meta: { collabRoomId, escrowId, campaignId, bidId },
        }),
        this.notificationRepository.createNotification({
          recipientId: creatorId,
          recipientRole: UserRole.Creator,
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
