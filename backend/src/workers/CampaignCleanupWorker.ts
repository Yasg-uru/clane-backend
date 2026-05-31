import type { ConsumeMessage } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { CreatorCampaignMatchRepository } from "../infrastructure/repositories/CreatorCampaignMatchRepository";
import { CAMPAIGN_EXCHANGE_NAME, CampaignEvent } from "../config/config.constants";
import { logger } from "../utils/logger";
import { BaseWorker } from "./BaseWorker";

export class CampaignCleanupWorker extends BaseWorker {
  protected readonly queueName = "creatorlane.campaign.cleanup";
  protected readonly exchangeName = CAMPAIGN_EXCHANGE_NAME;
  protected readonly routingKey = [CampaignEvent.Unpublished, CampaignEvent.Closed, CampaignEvent.Expired];
  protected readonly prefetch = 10;

  constructor(
    private readonly creatorCampaignMatchRepository: CreatorCampaignMatchRepository,
    rabbitMQ: RabbitMQConnection,
  ) {
    super(rabbitMQ);
  }

  protected async handleMessage(msg: ConsumeMessage): Promise<void> {
    const channel = this.channel;
    if (!channel) return;

    logger.debug("CampaignCleanupWorker: received message", {
      queue: this.queueName,
      routingKey: msg.fields.routingKey,
    });

    try {
      const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
      const campaignId = payload["campaignId"];

      if (typeof campaignId !== "string") {
        channel.nack(msg, false, false);
        return;
      }

      await this.creatorCampaignMatchRepository.deleteMatchesForCampaign(campaignId);
      channel.ack(msg);
    } catch (err) {
      logger.error("CampaignCleanupWorker: processing error", { err });
      channel.nack(msg, false, true);
    }
  }
}
