import type { CreatorCampaignMatchDocument } from "../../models/CreatorCampaignMatch.model";
import type { MatchScoreResult } from "../types";

export interface ICreatorCampaignMatchRepository {
  upsertMatch(creatorId: string, campaignId: string, score: MatchScoreResult): Promise<void>;
  bulkUpsertMatches(
    campaignId: string,
    scores: Array<{ creatorId: string; score: MatchScoreResult }>,
  ): Promise<void>;
  findMatchesForCreator(creatorId: string, campaignIds: string[]): Promise<Map<string, number>>;
  findTopMatchesForCreator(creatorId: string, limit: number): Promise<CreatorCampaignMatchDocument[]>;
  findMatchesForCampaign(campaignId: string, creatorIds: string[]): Promise<Map<string, number>>;
  deleteMatchesForCampaign(campaignId: string): Promise<void>;
}
