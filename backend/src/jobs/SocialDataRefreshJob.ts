import type { ICreatorRepository } from "../core/interfaces/ICreatorRepository";
import type { IEventPublisher } from "../core/interfaces/IEventPublisher";
import { CREATOR_EXCHANGE_NAME, CreatorEvent } from "../config/config.constants";
import { logger } from "../utils/logger";
import { BaseJob } from "./BaseJob";

export class SocialDataRefreshJob extends BaseJob {
  private static readonly INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

  protected readonly intervalMs = SocialDataRefreshJob.INTERVAL_MS;

  constructor(
    private readonly creatorRepository: ICreatorRepository,
    private readonly eventPublisher: IEventPublisher,
  ) {
    super();
  }

  protected async run(): Promise<void> {
    const [instagramCreators, youtubeCreators] = await Promise.all([
      this.creatorRepository.findCreatorsForInstagramRefresh(),
      this.creatorRepository.findCreatorsForYoutubeRefresh(),
    ]);

    for (const creator of instagramCreators) {
      this.eventPublisher.publish(
        CreatorEvent.InstagramDataRefresh,
        { creatorId: creator._id.toString() },
        CREATOR_EXCHANGE_NAME,
      );
    }

    for (const creator of youtubeCreators) {
      this.eventPublisher.publish(
        CreatorEvent.YoutubeDataRefresh,
        { creatorId: creator._id.toString() },
        CREATOR_EXCHANGE_NAME,
      );
    }

    logger.info("SocialDataRefreshJob: dispatched refresh events", {
      instagram: instagramCreators.length,
      youtube: youtubeCreators.length,
    });
  }
}
