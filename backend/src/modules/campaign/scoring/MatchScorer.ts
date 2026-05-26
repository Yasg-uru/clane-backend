import type { MatchScoreResult } from "../../../core/types";
import type { MatchScorerCampaign, MatchScorerCreator } from "./IScorer";
import type { NicheScorer } from "./NicheScorer";
import type { PlatformScorer } from "./PlatformScorer";
import type { FollowerScorer } from "./FollowerScorer";
import type { LocationScorer } from "./LocationScorer";
import type { ProximityScorer } from "./ProximityScorer";
import type { RequirementsScorer } from "./RequirementsScorer";

// Scoring weights by delivery type.
//
// Remote — proximity is irrelevant; city is a soft 5% signal.
//   niche 35 | platform 25 | follower 20 | requirements 15 | city 5
//
// Onsite — geo proximity is critical for logistics; city-name match is dropped.
//   niche 30 | platform 20 | follower 15 | requirements 15 | proximity 20
const WEIGHTS = {
  remote: { niche: 0.35, platform: 0.25, follower: 0.20, requirements: 0.15, location: 0.05, proximity: 0.00 },
  onsite: { niche: 0.30, platform: 0.20, follower: 0.15, requirements: 0.15, location: 0.00, proximity: 0.20 },
} as const;

export class MatchScorer {
  constructor(
    private readonly nicheScorer: NicheScorer,
    private readonly platformScorer: PlatformScorer,
    private readonly followerScorer: FollowerScorer,
    private readonly locationScorer: LocationScorer,
    private readonly proximityScorer: ProximityScorer,
    private readonly requirementsScorer: RequirementsScorer,
  ) {}

  compute(campaign: MatchScorerCampaign, creator: MatchScorerCreator): MatchScoreResult {
    const isOnsite = campaign.deliveryType === "onsite";
    const w = isOnsite ? WEIGHTS.onsite : WEIGHTS.remote;

    const nicheScore = this.nicheScorer.score(campaign, creator);
    const platformScore = this.platformScorer.score(campaign, creator);
    const followerScore = this.followerScorer.score(campaign, creator);
    const locationScore = this.locationScorer.score(campaign, creator);
    const proximityScore = isOnsite ? this.proximityScorer.score(campaign, creator) : 0;
    const requirementsScore = this.requirementsScorer.score(campaign, creator);

    const matchScore = Math.round(
      nicheScore * w.niche +
      platformScore * w.platform +
      followerScore * w.follower +
      requirementsScore * w.requirements +
      locationScore * w.location +
      proximityScore * w.proximity,
    );

    return {
      matchScore,
      matchBreakdown: { nicheScore, platformScore, followerScore, locationScore, requirementsScore, proximityScore },
    };
  }
}
