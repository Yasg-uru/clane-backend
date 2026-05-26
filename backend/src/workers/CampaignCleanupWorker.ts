import type { Channel } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { CreatorCampaignMatchRepository } from "../infrastructure/repositories/CreatorCampaignMatchRepository";
import { CAMPAIGN_EXCHANGE_NAME } from "../config/config.constants";
import { logger } from "../utils/logger";

const QUEUE_NAME = "creatorlane.campaign.cleanup";
const ROUTING_KEYS = ["campaign.unpublished", "campaign.closed", "campaign.expired"];
const PREFETCH = 10;

export class CampaignCleanupWorker {
  private channel: Channel | null = null;
  private consumerTag: string | null = null;

  constructor(
    private readonly creatorCampaignMatchRepository: CreatorCampaignMatchRepository,
    private readonly rabbitMQ: RabbitMQConnection,
  ) {}

  async start(): Promise<void> {
    this.channel = await this.rabbitMQ.createChannel();
    await this.channel.assertExchange(CAMPAIGN_EXCHANGE_NAME, "topic", { durable: true });
    await this.channel.assertQueue(QUEUE_NAME, { durable: true });

    for (const key of ROUTING_KEYS) {
      await this.channel.bindQueue(QUEUE_NAME, CAMPAIGN_EXCHANGE_NAME, key);
    }

    this.channel.prefetch(PREFETCH);

    const { consumerTag } = await this.channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;
        logger.debug("CampaignCleanupWorker: received message", {
          queue: QUEUE_NAME,
          routingKey: msg.fields.routingKey,
        });

        try {
          const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
          const campaignId = payload["campaignId"];

          if (typeof campaignId !== "string") {
            this.channel?.nack(msg, false, false);
            return;
          }

          await this.creatorCampaignMatchRepository.deleteMatchesForCampaign(campaignId);
          this.channel?.ack(msg);
        } catch (err) {
          logger.error("CampaignCleanupWorker: processing error", { err });
          this.channel?.nack(msg, false, true);
        }
      },
      { noAck: false },
    );

    this.consumerTag = consumerTag;
    logger.info("CampaignCleanupWorker started");
  }

  async stop(): Promise<void> {
    if (this.channel && this.consumerTag) {
      await this.channel.cancel(this.consumerTag);
    }
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    logger.info("CampaignCleanupWorker stopped");
  }
}
