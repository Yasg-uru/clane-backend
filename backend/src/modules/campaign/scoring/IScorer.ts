export interface MatchScorerCampaign {
  platform: string;
  niche: string[];
  targetLocation: string;
  budgetAmount: number;
  deliveryType: string;
  shootingLocation?: { geo: { coordinates: [number, number] }; radiusKm?: number } | null;
  creatorRequirements?: { instagram?: { minFollowers?: number; maxFollowers?: number } | null } | null;
}

export interface MatchScorerCreator {
  instagramFollowers?: number;
  niche?: string[];
  city?: string;
  instagramConnected?: boolean;
  location?: { coordinates: [number, number] } | null;
}

export interface IScorer {
  score(campaign: MatchScorerCampaign, creator: MatchScorerCreator): number;
}
