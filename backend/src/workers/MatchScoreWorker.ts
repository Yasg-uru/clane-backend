import type { Channel } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { CreatorCampaignMatchRepository } from "../infrastructure/repositories/CreatorCampaignMatchRepository";
import type { CreatorRepository } from "../infrastructure/repositories/CreatorRepository";
import type { MatchScorer } from "../modules/campaign/scoring/MatchScorer";
import { CAMPAIGN_EXCHANGE_NAME } from "../config/config.constants";
import { logger } from "../utils/logger";
import { CampaignDeliveryType } from "../models/Campaign.model";

const QUEUE_NAME = "creatorlane.match.compute";
const ROUTING_KEY = "campaign.published";
const PREFETCH = 10;

export class MatchScoreWorker {
  private channel: Channel | null = null;
  private consumerTag: string | null = null;

  constructor(
    private readonly creatorCampaignMatchRepository: CreatorCampaignMatchRepository,
    private readonly creatorRepository: CreatorRepository,
    private readonly rabbitMQ: RabbitMQConnection,
    private readonly matchScorer: MatchScorer,
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
        logger.debug("MatchScoreWorker: received message", { queue: QUEUE_NAME });

        try {
          const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
          const campaignId = payload["campaignId"];

          if (typeof campaignId !== "string") {
            this.channel?.nack(msg, false, false);
            return;
          }

          await this.computeAndStoreMatchScores(campaignId, payload);
          this.channel?.ack(msg);
        } catch (err) {
          logger.error("MatchScoreWorker: processing error", { err });
          this.channel?.nack(msg, false, true);
        }
      },
      { noAck: false },
    );

    this.consumerTag = consumerTag;
    logger.info("MatchScoreWorker started");
  }

  async stop(): Promise<void> {
    if (this.channel && this.consumerTag) {
      await this.channel.cancel(this.consumerTag);
    }
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    logger.info("MatchScoreWorker stopped");
  }

  private async computeAndStoreMatchScores(
    campaignId: string,
    campaignPayload: Record<string, unknown>,
  ): Promise<void> {
    const creators = await this.creatorRepository.findAllActive();
    if (creators.length === 0) return;

    const rawShooting = campaignPayload["shootingLocation"];
    const rawRequirements = campaignPayload["creatorRequirements"];

    const campaign = {
      platform: String(campaignPayload["platform"] ?? ""),
      niche: Array.isArray(campaignPayload["niche"]) ? (campaignPayload["niche"] as string[]) : [],
      targetLocation: String(campaignPayload["targetLocation"] ?? ""),
      budgetAmount: Number(campaignPayload["budgetAmount"] ?? 0),
      deliveryType: String(campaignPayload["deliveryType"] ?? CampaignDeliveryType.Remote),
      shootingLocation: rawShooting != null && typeof rawShooting === "object"
        ? (rawShooting as { geo: { coordinates: [number, number] }; radiusKm?: number })
        : null,
      creatorRequirements: rawRequirements != null && typeof rawRequirements === "object"
        ? (rawRequirements as { instagram?: { minFollowers?: number; maxFollowers?: number } })
        : null,
    };

    const scores = creators.map((creator) => ({
      creatorId: creator._id.toString(),
      score: this.matchScorer.compute(campaign, creator),
    }));

    await this.creatorCampaignMatchRepository.bulkUpsertMatches(campaignId, scores);
    logger.debug("MatchScoreWorker: computed scores", { campaignId, creatorCount: creators.length });
  }
}
