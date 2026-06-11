import type { IScorer, MatchScorerCampaign, MatchScorerCreator } from "./IScorer";

// Geo-distance scorer for onsite campaigns.
// Uses Haversine great-circle distance.
// When the brand specifies a radiusKm on shootingLocation, scoring respects that boundary.
// Without radiusKm, graduated distance bands are used instead.
export class ProximityScorer implements IScorer {
  score(campaign: MatchScorerCampaign, creator: MatchScorerCreator): number {
    const shooting = campaign.shootingLocation;
    const creatorLoc = creator.location;
    if (!shooting || !creatorLoc) return 0;

    const [sLon, sLat] = shooting.geo.coordinates;
    const [cLon, cLat] = creatorLoc.coordinates;
    const distKm = this.haversineKm(sLon, sLat, cLon, cLat);
    const radius = shooting.radiusKm;

    if (radius !== undefined && radius > 0) {
      if (distKm <= radius) return 100;
      if (distKm <= radius * 1.5) return 60;
      if (distKm <= radius * 2) return 30;
      return 0;
    }

    if (distKm < 20) return 100;
    if (distKm < 50) return 80;
    if (distKm < 100) return 50;
    if (distKm < 300) return 20;
    return 0;
  }

  // GeoJSON coordinates are [longitude, latitude].
  private haversineKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
