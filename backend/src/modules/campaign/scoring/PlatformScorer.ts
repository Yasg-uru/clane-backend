import type { IScorer, MatchScorerCampaign, MatchScorerCreator } from "./IScorer";
import { CampaignPlatform } from "../../../models/Campaign.model";

export class PlatformScorer implements IScorer {
  score(campaign: MatchScorerCampaign, creator: MatchScorerCreator): number {
    const hasInstagram = creator.instagramConnected ?? false;
    if (campaign.platform === CampaignPlatform.Instagram) return hasInstagram ? 100 : 0;
    if (campaign.platform === CampaignPlatform.Both) return hasInstagram ? 50 : 0;
    // youtube: no YouTube profile data on creators yet
    return 0;
  }
}
