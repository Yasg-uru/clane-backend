import type { CampaignService } from "../modules/campaign/CampaignService";
import { BaseJob } from "./BaseJob";

export class CampaignExpiryJob extends BaseJob {
  protected readonly intervalMs = 60 * 60 * 1000; // 1 hour

  constructor(private readonly campaignService: CampaignService) {
    super();
  }

  protected async run(): Promise<void> {
    await this.campaignService.handleExpiredCampaigns();
  }
}
