import type { ConsumeMessage } from "amqplib";
import type { RabbitMQConnection } from "../config/RabbitMQConnection";
import type { ICreatorRepository } from "../core/interfaces/ICreatorRepository";
import type { IYoutubeDataService } from "../core/interfaces/IYoutubeDataService";
import type { IEventPublisher } from "../core/interfaces/IEventPublisher";
import {
  CREATOR_EXCHANGE_NAME,
  CreatorEvent,
  CREATOR_YOUTUBE_DATA_BINDING,
} from "../config/config.constants";
import { EncryptionService } from "../utils/crypto";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { BaseWorker } from "./BaseWorker";

export class YoutubeDataWorker extends BaseWorker {
  protected readonly queueName = "creatorlane.creator.youtube.data";
  protected readonly exchangeName = CREATOR_EXCHANGE_NAME;
  protected readonly routingKey = CREATOR_YOUTUBE_DATA_BINDING;
  protected readonly prefetch = 5;

  constructor(
    private readonly creatorRepository: ICreatorRepository,
    private readonly youtubeDataService: IYoutubeDataService,
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

      await this.fetchAndStoreYoutubeData(creatorId);
      channel.ack(msg);
    } catch (err) {
      logger.error("YoutubeDataWorker: processing error", { err });
      channel.nack(msg, false, true);
    }
  }

  private async fetchAndStoreYoutubeData(creatorId: string): Promise<void> {
    const creator = await this.creatorRepository.findByIdWithYoutubeTokens(creatorId);

    if (!creator?.youtubeAccessToken) {
      logger.warn("YoutubeDataWorker: creator has no YouTube token", { creatorId });
      return;
    }

    let accessToken: string;
    try {
      accessToken = EncryptionService.decryptToken(
        creator.youtubeAccessToken,
        env.INSTAGRAM_TOKEN_ENCRYPTION_KEY,
      );
    } catch {
      logger.error("YoutubeDataWorker: failed to decrypt YouTube token", { creatorId });
      return;
    }

    // Refresh the access token if it has expired
    if (creator.youtubeTokenExpiresAt && creator.youtubeTokenExpiresAt < new Date()) {
      accessToken = await this.refreshExpiredToken(creatorId, creator.youtubeRefreshToken);
      if (!accessToken) return;
    }

    const channelData = await this.youtubeDataService.fetchChannelData(accessToken);
    const now = new Date();

    await this.creatorRepository.updateYoutubePlatformData(creatorId, {
      youtubeSubscriberCount: channelData.subscriberCount,
      youtubeVideoCount: channelData.videoCount,
      youtubeTotalViewCount: channelData.totalViewCount,
      youtubeAvgViews: channelData.avgViews,
      youtubeAvgLikes: channelData.avgLikes,
      youtubeAvgComments: channelData.avgComments,
      youtubeEngagementRate: channelData.engagementRate,
      youtubeDataFetchedAt: now,
      youtubeDataLastRefreshedAt: now,
    });

    this.eventPublisher.publish(
      CreatorEvent.YoutubeDataReady,
      {
        creatorId,
        subscriberCount: channelData.subscriberCount,
        videoCount: channelData.videoCount,
        totalViewCount: channelData.totalViewCount,
        avgViews: channelData.avgViews,
        avgLikes: channelData.avgLikes,
        avgComments: channelData.avgComments,
        engagementRate: channelData.engagementRate,
      },
      CREATOR_EXCHANGE_NAME,
    );

    logger.info("YoutubeDataWorker: data fetched and stored", { creatorId });
  }

  private async refreshExpiredToken(
    creatorId: string,
    encryptedRefreshToken: string | undefined,
  ): Promise<string> {
    if (!encryptedRefreshToken) {
      logger.warn("YoutubeDataWorker: no refresh token available", { creatorId });
      return "";
    }

    let decryptedRefreshToken: string;
    try {
      decryptedRefreshToken = EncryptionService.decryptToken(
        encryptedRefreshToken,
        env.INSTAGRAM_TOKEN_ENCRYPTION_KEY,
      );
    } catch {
      logger.error("YoutubeDataWorker: failed to decrypt refresh token", { creatorId });
      return "";
    }

    try {
      const tokens = await this.youtubeDataService.refreshAccessToken(decryptedRefreshToken);

      const encryptedNewAccess = EncryptionService.encryptToken(
        tokens.accessToken,
        env.INSTAGRAM_TOKEN_ENCRYPTION_KEY,
      );
      const encryptedNewRefresh = EncryptionService.encryptToken(
        tokens.refreshToken,
        env.INSTAGRAM_TOKEN_ENCRYPTION_KEY,
      );

      await this.creatorRepository.updateYoutubeTokens(creatorId, {
        youtubeAccessToken: encryptedNewAccess,
        youtubeRefreshToken: encryptedNewRefresh,
        youtubeTokenExpiresAt: tokens.expiresAt,
      });

      return tokens.accessToken;
    } catch (err) {
      logger.error("YoutubeDataWorker: token refresh failed", { creatorId, err });
      return "";
    }
  }
}
