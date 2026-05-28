import type { Channel } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { NotificationRepository } from "../infrastructure/repositories/NotificationRepository";
import { BID_EXCHANGE_NAME } from "../config/config.constants";
import { logger } from "../utils/logger";
import { UserRole } from "../core/types";

const QUEUE_NAME = "creatorlane.bid.notifications";
const PREFETCH = 20;

export class BidNotificationWorker {
  private channel: Channel | null = null;
  private consumerTag: string | null = null;

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly rabbitMQ: RabbitMQConnection,
  ) {}

  async start(): Promise<void> {
    this.channel = await this.rabbitMQ.createChannel();
    await this.channel.assertExchange(BID_EXCHANGE_NAME, "topic", { durable: true });
    await this.channel.assertQueue(QUEUE_NAME, { durable: true });
    await this.channel.bindQueue(QUEUE_NAME, BID_EXCHANGE_NAME, "bid.*");
    this.channel.prefetch(PREFETCH);

    const { consumerTag } = await this.channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;
        logger.debug("BidNotificationWorker: received message", { routingKey: msg.fields.routingKey });

        try {
          const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
          await this.handleEvent(msg.fields.routingKey, payload);
          this.channel?.ack(msg);
        } catch (err) {
          logger.error("BidNotificationWorker: processing error", { err, routingKey: msg.fields.routingKey });
          this.channel?.nack(msg, false, true);
        }
      },
      { noAck: false },
    );

    this.consumerTag = consumerTag;
    logger.info("BidNotificationWorker started");
  }

  async stop(): Promise<void> {
    if (this.channel && this.consumerTag) {
      await this.channel.cancel(this.consumerTag);
    }
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    logger.info("BidNotificationWorker stopped");
  }

  private async handleEvent(routingKey: string, payload: Record<string, unknown>): Promise<void> {
    switch (routingKey) {
      case "bid.submitted":
        await this.onBidSubmitted(payload);
        break;
      case "bid.shortlisted":
        await this.onBidShortlisted(payload);
        break;
      case "bid.declined":
        await this.onBidDeclined(payload);
        break;
      case "bid.withdrawn":
        await this.onBidWithdrawn(payload);
        break;
      case "bid.accepted":
        await this.onBidAccepted(payload);
        break;
      case "bid.bulk_declined":
        await this.onBidBulkDeclined(payload);
        break;
      default:
        logger.warn("BidNotificationWorker: unknown routing key", { routingKey });
    }
  }

  private async onBidSubmitted(payload: Record<string, unknown>): Promise<void> {
    const brandId = String(payload["brandId"] ?? "");
    const campaignId = String(payload["campaignId"] ?? "");
    const bidId = String(payload["bidId"] ?? "");
    const proposedAmount = Number(payload["proposedAmount"] ?? 0);
    const campaignTitle = String(payload["campaignTitle"] ?? "your campaign");

    await this.notificationRepository.createNotification({
      recipientId: brandId,
      recipientRole: UserRole.Brand,
      type: "bid.submitted",
      title: "New bid received",
      body: `A creator submitted a bid of ₹${proposedAmount.toLocaleString("en-IN")} on ${campaignTitle}`,
      meta: { bidId, campaignId },
    });
  }

  private async onBidShortlisted(payload: Record<string, unknown>): Promise<void> {
    const creatorId = String(payload["creatorId"] ?? "");
    const campaignId = String(payload["campaignId"] ?? "");
    const bidId = String(payload["bidId"] ?? "");

    await this.notificationRepository.createNotification({
      recipientId: creatorId,
      recipientRole: UserRole.Creator,
      type: "bid.shortlisted",
      title: "Your bid has been shortlisted",
      body: "A brand has shortlisted your bid for further review",
      meta: { bidId, campaignId },
    });
  }

  private async onBidDeclined(payload: Record<string, unknown>): Promise<void> {
    const creatorId = String(payload["creatorId"] ?? "");
    const campaignId = String(payload["campaignId"] ?? "");
    const bidId = String(payload["bidId"] ?? "");

    await this.notificationRepository.createNotification({
      recipientId: creatorId,
      recipientRole: UserRole.Creator,
      type: "bid.declined",
      title: "Your bid was not selected",
      body: "The brand has reviewed your bid and decided not to proceed at this time",
      meta: { bidId, campaignId },
    });
  }

  private async onBidWithdrawn(payload: Record<string, unknown>): Promise<void> {
    const brandId = String(payload["brandId"] ?? "");
    const campaignId = String(payload["campaignId"] ?? "");
    const bidId = String(payload["bidId"] ?? "");

    await this.notificationRepository.createNotification({
      recipientId: brandId,
      recipientRole: UserRole.Brand,
      type: "bid.withdrawn",
      title: "A creator withdrew their bid",
      body: "A creator has withdrawn their bid from your campaign",
      meta: { bidId, campaignId },
    });
  }

  private async onBidAccepted(payload: Record<string, unknown>): Promise<void> {
    const creatorId = String(payload["creatorId"] ?? "");
    const campaignId = String(payload["campaignId"] ?? "");
    const bidId = String(payload["bidId"] ?? "");
    const agreedAmount = Number(payload["agreedAmount"] ?? 0);

    await this.notificationRepository.createNotification({
      recipientId: creatorId,
      recipientRole: UserRole.Creator,
      type: "bid.accepted",
      title: "Congratulations! Your bid was accepted",
      body: `Your bid of ₹${agreedAmount.toLocaleString("en-IN")} has been accepted. Get ready to collaborate!`,
      meta: { bidId, campaignId, agreedAmount },
    });
  }

  private async onBidBulkDeclined(payload: Record<string, unknown>): Promise<void> {
    const campaignId = String(payload["campaignId"] ?? "");
    const rawDeclinedBids = payload["declinedBids"];

    if (!Array.isArray(rawDeclinedBids)) {
      logger.warn("BidNotificationWorker: invalid declinedBids in bulk_declined event", { campaignId });
      return;
    }

    const notifications = rawDeclinedBids
      .filter(
        (item): item is { bidId: string; creatorId: string } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as Record<string, unknown>)["bidId"] === "string" &&
          typeof (item as Record<string, unknown>)["creatorId"] === "string",
      )
      .map((item) =>
        this.notificationRepository.createNotification({
          recipientId: item.creatorId,
          recipientRole: UserRole.Creator,
          type: "bid.declined",
          title: "Your bid was not selected",
          body: "The campaign has selected another creator. Thank you for your bid!",
          meta: { bidId: item.bidId, campaignId, autoDeclined: true },
        }),
      );

    await Promise.all(notifications);
  }
}
