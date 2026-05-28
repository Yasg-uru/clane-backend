import type { ConsumeMessage } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { CampaignRepository } from "../infrastructure/repositories/CampaignRepository";
import { CAMPAIGN_EXCHANGE_NAME } from "../config/config.constants";
import { logger } from "../utils/logger";
import { BaseWorker } from "./BaseWorker";

export class ViewCountWorker extends BaseWorker {
  protected readonly queueName = "creatorlane.campaign.views";
  protected readonly exchangeName = CAMPAIGN_EXCHANGE_NAME;
  protected readonly routingKey = "campaign.viewed";
  protected readonly prefetch = 50;

  constructor(
    private readonly campaignRepository: CampaignRepository,
    rabbitMQ: RabbitMQConnection,
  ) {
    super(rabbitMQ);
  }

  protected async handleMessage(msg: ConsumeMessage): Promise<void> {
    const channel = this.channel;
    if (!channel) return;

    logger.debug("ViewCountWorker: received message", { queue: this.queueName });

    try {
      const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
      const campaignId = payload["campaignId"];

      if (typeof campaignId !== "string") {
        channel.nack(msg, false, false);
        return;
      }

      await this.campaignRepository.incrementViewCount(campaignId);
      channel.ack(msg);
    } catch (err) {
      logger.error("ViewCountWorker: processing error", { err });
      channel.nack(msg, false, true);
    }
  }
}
