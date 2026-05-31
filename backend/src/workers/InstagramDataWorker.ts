import type { ConsumeMessage } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { ICreatorRepository } from "../core/interfaces/ICreatorRepository";
import type { IInstagramGraphService } from "../core/interfaces/IInstagramGraphService";
import type { IEventPublisher } from "../core/interfaces/IEventPublisher";
import {
  CREATOR_EXCHANGE_NAME,
  CreatorEvent,
  CREATOR_INSTAGRAM_DATA_BINDING,
} from "../config/config.constants";
import { EncryptionService } from "../utils/crypto";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { BaseWorker } from "./BaseWorker";

export class InstagramDataWorker extends BaseWorker {
  protected readonly queueName = "creatorlane.creator.instagram.data";
  protected readonly exchangeName = CREATOR_EXCHANGE_NAME;
  protected readonly routingKey = CREATOR_INSTAGRAM_DATA_BINDING;
  protected readonly prefetch = 5;

  constructor(
    private readonly creatorRepository: ICreatorRepository,
    private readonly instagramGraphService: IInstagramGraphService,
    private readonly eventPublisher: IEventPublisher,
    rabbitMQ: RabbitMQConnection,
  ) {
    super(rabbitMQ);
  }

  protected async handleMessage(msg: ConsumeMessage): Promise<void> {
    const channel = this.channel;
    if (!channel) return;

    try {
      const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
      const creatorId = payload["creatorId"];

      if (typeof creatorId !== "string") {
        channel.nack(msg, false, false);
        return;
      }

      await this.fetchAndStoreInstagramData(creatorId);
      channel.ack(msg);
    } catch (err) {
      logger.error("InstagramDataWorker: processing error", { err });
      channel.nack(msg, false, true);
    }
  }

  private async fetchAndStoreInstagramData(creatorId: string): Promise<void> {
    const creator = await this.creatorRepository.findByIdWithInstagramToken(creatorId);

    if (!creator?.instagramAccessToken) {
      logger.warn("InstagramDataWorker: creator has no Instagram token", { creatorId });
      return;
    }

    let decryptedToken: string;
    try {
      decryptedToken = EncryptionService.decryptToken(
        creator.instagramAccessToken,
        env.INSTAGRAM_TOKEN_ENCRYPTION_KEY,
      );
    } catch {
      logger.error("InstagramDataWorker: failed to decrypt Instagram token", { creatorId });
      return;
    }

    const profile = await this.instagramGraphService.fetchRichProfile(decryptedToken);
    const now = new Date();

    await this.creatorRepository.updateInstagramPlatformData(creatorId, {
      instagramFollowers: profile.followersCount,
      instagramPostCount: profile.mediaCount,
      instagramAvgLikes: profile.avgLikes,
      instagramAvgComments: profile.avgComments,
      instagramEngagementRate: profile.engagementRate,
      instagramDataFetchedAt: now,
      instagramDataLastRefreshedAt: now,
    });

    this.eventPublisher.publish(
      CreatorEvent.InstagramDataReady,
      {
        creatorId,
        followersCount: profile.followersCount,
        followingCount: profile.followingCount,
        mediaCount: profile.mediaCount,
        avgLikes: profile.avgLikes,
        avgComments: profile.avgComments,
        engagementRate: profile.engagementRate,
      },
      CREATOR_EXCHANGE_NAME,
    );

    logger.info("InstagramDataWorker: data fetched and stored", { creatorId });
  }
}
