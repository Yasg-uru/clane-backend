import type { Channel } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { CampaignRepository } from "../infrastructure/repositories/CampaignRepository";
import { CAMPAIGN_EXCHANGE_NAME } from "../config/config.constants";
import { logger } from "../utils/logger";

const QUEUE_NAME = "creatorlane.campaign.views";
const ROUTING_KEY = "campaign.viewed";
const PREFETCH = 50;

export class ViewCountWorker {
  private channel: Channel | null = null;
  private consumerTag: string | null = null;

  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly rabbitMQ: RabbitMQConnection,
  ) {}

  async start(): Promise<void> {
    this.channel = await this.rabbitMQ.createChannel();
    await this.channel.assertExchange(CAMPAIGN_EXCHANGE_NAME, "topic", { durable: true });
    await this.channel.assertQueue(QUEUE_NAME, { durable: true });
    await this.channel.bindQueue(QUEUE_NAME, CAMPAIGN_EXCHANGE_NAME, ROUTING_KEY);
    this.channel.prefetch(PREFETCH);

    const { consumerTag } = await this.channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;
        logger.debug("ViewCountWorker: received message", { queue: QUEUE_NAME });

        try {
          const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
          const campaignId = payload["campaignId"];

          if (typeof campaignId !== "string") {
            this.channel?.nack(msg, false, false);
            return;
          }

          await this.campaignRepository.incrementViewCount(campaignId);
          this.channel?.ack(msg);
        } catch (err) {
          logger.error("ViewCountWorker: processing error", { err });
          this.channel?.nack(msg, false, true);
        }
      },
      { noAck: false },
    );

    this.consumerTag = consumerTag;
    logger.info("ViewCountWorker started");
  }

  async stop(): Promise<void> {
    if (this.channel && this.consumerTag) {
      await this.channel.cancel(this.consumerTag);
    }
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    logger.info("ViewCountWorker stopped");
  }
}
