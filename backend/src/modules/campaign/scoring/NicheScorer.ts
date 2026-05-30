import type { IScorer, MatchScorerCampaign, MatchScorerCreator } from "./IScorer";

export class NicheScorer implements IScorer {
  score(campaign: MatchScorerCampaign, creator: MatchScorerCreator): number {
    const campaignNiches = campaign.niche;
    if (campaignNiches.length === 0) return 0;
    const creatorNiches = creator.niche ?? [];
    const overlap = campaignNiches.filter((n) => creatorNiches.includes(n)).length;
    return Math.round((overlap / campaignNiches.length) * 100);
  }
}
