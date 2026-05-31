import type { IScorer, MatchScorerCampaign, MatchScorerCreator } from "./IScorer";

// Scores how well a creator satisfies the brand's explicit creator requirements.
// Only checks requirements for which we have creator data (Instagram follower count).
// Returns 100 when no checkable requirements are set — no constraint means all eligible.
export class RequirementsScorer implements IScorer {
  score(campaign: MatchScorerCampaign, creator: MatchScorerCreator): number {
    const requirements = campaign.creatorRequirements;
    if (!requirements) return 100;

    const checks: boolean[] = [];
    const ig = requirements.instagram;

    if (ig && (creator.instagramConnected ?? false)) {
      const followers = creator.instagramFollowers ?? 0;
      if (ig.minFollowers !== undefined) checks.push(followers >= ig.minFollowers);
      if (ig.maxFollowers !== undefined) checks.push(followers <= ig.maxFollowers);
    }

    if (checks.length === 0) return 100;
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }
}
