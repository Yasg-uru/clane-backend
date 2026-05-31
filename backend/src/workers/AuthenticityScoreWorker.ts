import type { ConsumeMessage } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { ICreatorRepository } from "../core/interfaces/ICreatorRepository";
import type { IAuthenticityScorer } from "../core/interfaces/IAuthenticityScorer";
import type {
  InstagramDataReadyPayload,
  YoutubeDataReadyPayload,
} from "../modules/social-verification/social-verification.types";
import { CREATOR_EXCHANGE_NAME, CreatorEvent } from "../config/config.constants";
import { logger } from "../utils/logger";
import { BaseWorker } from "./BaseWorker";

export class AuthenticityScoreWorker extends BaseWorker {
  protected readonly queueName = "creatorlane.creator.score";
  protected readonly exchangeName = CREATOR_EXCHANGE_NAME;
  protected readonly routingKey = [CreatorEvent.InstagramDataReady, CreatorEvent.YoutubeDataReady];
  protected readonly prefetch = 10;

  constructor(
    private readonly creatorRepository: ICreatorRepository,
    private readonly authenticityScorer: IAuthenticityScorer,
    rabbitMQ: RabbitMQConnection,
  ) {
    super(rabbitMQ);
  }

  protected async handleMessage(msg: ConsumeMessage): Promise<void> {
    const channel = this.channel;
    if (!channel) return;

    try {
      const routingKey = msg.fields.routingKey;
      const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
      const creatorId = payload["creatorId"];

      if (typeof creatorId !== "string") {
        channel.nack(msg, false, false);
        return;
      }

      if (routingKey === CreatorEvent.InstagramDataReady) {
        await this.scoreInstagram(creatorId, payload as unknown as InstagramDataReadyPayload);
      } else if (routingKey === CreatorEvent.YoutubeDataReady) {
        await this.scoreYoutube(creatorId, payload as unknown as YoutubeDataReadyPayload);
      }

      channel.ack(msg);
    } catch (err) {
      logger.error("AuthenticityScoreWorker: processing error", { err });
      channel.nack(msg, false, true);
    }
  }

  private async scoreInstagram(creatorId: string, payload: InstagramDataReadyPayload): Promise<void> {
    const result = this.authenticityScorer.scoreInstagram({
      followersCount: payload.followersCount,
      followingCount: payload.followingCount,
      mediaCount: payload.mediaCount,
      avgLikes: payload.avgLikes,
      avgComments: payload.avgComments,
      engagementRate: payload.engagementRate,
    });

    await this.creatorRepository.updateInstagramAuthenticityScore(
      creatorId,
      result.score,
      result.risk,
    );

    logger.info("AuthenticityScoreWorker: Instagram scored", {
      creatorId,
      score: result.score,
      risk: result.risk,
    });
  }

  private async scoreYoutube(creatorId: string, payload: YoutubeDataReadyPayload): Promise<void> {
    const result = this.authenticityScorer.scoreYoutube({
      subscriberCount: payload.subscriberCount,
      videoCount: payload.videoCount,
      totalViewCount: payload.totalViewCount,
      avgViews: payload.avgViews,
      avgLikes: payload.avgLikes,
      avgComments: payload.avgComments,
      engagementRate: payload.engagementRate,
    });

    await this.creatorRepository.updateYoutubeAuthenticityScore(
      creatorId,
      result.score,
      result.risk,
    );

    logger.info("AuthenticityScoreWorker: YouTube scored", {
      creatorId,
      score: result.score,
      risk: result.risk,
    });
  }
}
