import type { IScorer, MatchScorerCampaign, MatchScorerCreator } from "./IScorer";

// Soft city-name match — used as a minor signal for remote campaigns.
export class LocationScorer implements IScorer {
  score(campaign: MatchScorerCampaign, creator: MatchScorerCreator): number {
    return creator.city?.toLowerCase() === campaign.targetLocation.toLowerCase() ? 100 : 0;
  }
}
