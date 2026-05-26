import type { CampaignService } from "../modules/campaign/CampaignService";
import { logger } from "../utils/logger";

const INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export class CampaignExpiryJob {
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly campaignService: CampaignService) {}

  start(): void {
    this.timer = setInterval(() => {
      this.campaignService.handleExpiredCampaigns().catch((err: unknown) => {
        logger.error("CampaignExpiryJob: error handling expired campaigns", { err });
      });
    }, INTERVAL_MS);

    logger.info("CampaignExpiryJob started", { intervalMs: INTERVAL_MS });
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    logger.info("CampaignExpiryJob stopped");
  }
}
