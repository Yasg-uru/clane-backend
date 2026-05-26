import type { IScorer, MatchScorerCampaign, MatchScorerCreator } from "./IScorer";

// Budget-to-creator-tier alignment.
// Micro budget (< ₹10k)  → prefers nano/micro creators (< 10k followers)
// Mid budget (₹10k–50k)  → prefers mid-tier creators (10k–100k)
// Macro budget (> ₹50k)  → prefers macro creators (> 100k)
export class FollowerScorer implements IScorer {
  score(campaign: MatchScorerCampaign, creator: MatchScorerCreator): number {
    const followers = creator.instagramFollowers ?? 0;
    const budget = campaign.budgetAmount;

    if (budget < 10_000) {
      if (followers < 10_000) return 100;
      if (followers <= 100_000) return 50;
      return 0;
    }

    if (budget <= 50_000) {
      if (followers >= 10_000 && followers <= 100_000) return 100;
      return 50;
    }

    if (followers > 100_000) return 100;
    if (followers >= 10_000) return 50;
    return 0;
  }
}
