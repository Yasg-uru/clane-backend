import type { ConsumeMessage } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { ICreatorCampaignMatchRepository } from "../core/interfaces/ICreatorCampaignMatchRepository";
import type { ICreatorRepository } from "../core/interfaces/ICreatorRepository";
import type { MatchScorer } from "../modules/campaign/scoring/MatchScorer";
import { CAMPAIGN_EXCHANGE_NAME, CampaignEvent } from "../config/config.constants";
import { logger } from "../utils/logger";
import { CampaignDeliveryType } from "../models/Campaign.model";
import { BaseWorker } from "./BaseWorker";

export class MatchScoreWorker extends BaseWorker {
  protected readonly queueName = "creatorlane.match.compute";
  protected readonly exchangeName = CAMPAIGN_EXCHANGE_NAME;
  protected readonly routingKey = CampaignEvent.Published;
  protected readonly prefetch = 10;

  constructor(
    private readonly creatorCampaignMatchRepository: ICreatorCampaignMatchRepository,
    private readonly creatorRepository: ICreatorRepository,
    rabbitMQ: RabbitMQConnection,
    private readonly matchScorer: MatchScorer,
  ) {
    super(rabbitMQ);
  }

  protected async handleMessage(msg: ConsumeMessage): Promise<void> {
    const channel = this.channel;
    if (!channel) return;

    logger.debug("MatchScoreWorker: received message", { queue: this.queueName });

    try {
      const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
      const campaignId = payload["campaignId"];

      if (typeof campaignId !== "string") {
        channel.nack(msg, false, false);
        return;
      }

      await this.computeAndStoreMatchScores(campaignId, payload);
      channel.ack(msg);
    } catch (err) {
      logger.error("MatchScoreWorker: processing error", { err });
      channel.nack(msg, false, true);
    }
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
