import { Types } from "mongoose";
import {
  CreatorCampaignMatchModel,
  type CreatorCampaignMatchDocument,
} from "../../models/CreatorCampaignMatch.model";
import type { MatchScoreResult } from "../../core/types";
import type { ICreatorCampaignMatchRepository } from "../../core/interfaces/ICreatorCampaignMatchRepository";

export class CreatorCampaignMatchRepository implements ICreatorCampaignMatchRepository {
  async upsertMatch(
    creatorId: string,
    campaignId: string,
    score: MatchScoreResult,
  ): Promise<void> {
    await CreatorCampaignMatchModel.findOneAndUpdate(
      {
        creatorId: new Types.ObjectId(creatorId),
        campaignId: new Types.ObjectId(campaignId),
      },
      {
        $set: {
          matchScore: score.matchScore,
          matchBreakdown: score.matchBreakdown,
          computedAt: new Date(),
        },
      },
      { upsert: true },
    ).exec();
  }

  async bulkUpsertMatches(
    campaignId: string,
    scores: Array<{ creatorId: string; score: MatchScoreResult }>,
  ): Promise<void> {
    if (scores.length === 0) return;

    const campaignOid = new Types.ObjectId(campaignId);
    const now = new Date();

    const operations = scores.map(({ creatorId, score }) => ({
      updateOne: {
        filter: {
          creatorId: new Types.ObjectId(creatorId),
          campaignId: campaignOid,
        },
        update: {
          $set: {
            matchScore: score.matchScore,
            matchBreakdown: score.matchBreakdown,
            computedAt: now,
          },
        },
        upsert: true,
      },
    }));

    await CreatorCampaignMatchModel.bulkWrite(operations);
  }

  async findMatchesForCreator(
    creatorId: string,
    campaignIds: string[],
  ): Promise<Map<string, number>> {
    const matches = await CreatorCampaignMatchModel.find({
      creatorId: new Types.ObjectId(creatorId),
      campaignId: { $in: campaignIds.map((id) => new Types.ObjectId(id)) },
    }).exec();

    const map = new Map<string, number>();
    for (const match of matches) {
      map.set(match.campaignId.toString(), match.matchScore);
    }
    return map;
  }

  async findTopMatchesForCreator(
    creatorId: string,
    limit: number,
  ): Promise<CreatorCampaignMatchDocument[]> {
    return CreatorCampaignMatchModel.find({ creatorId: new Types.ObjectId(creatorId) })
      .sort({ matchScore: -1 })
      .limit(limit)
      .exec();
  }

  async findMatchesForCampaign(
    campaignId: string,
    creatorIds: string[],
  ): Promise<Map<string, number>> {
    const matches = await CreatorCampaignMatchModel.find({
      campaignId: new Types.ObjectId(campaignId),
      creatorId: { $in: creatorIds.map((id) => new Types.ObjectId(id)) },
    }).exec();

    const map = new Map<string, number>();
    for (const match of matches) {
      map.set(match.creatorId.toString(), match.matchScore);
    }
    return map;
  }

  async deleteMatchesForCampaign(campaignId: string): Promise<void> {
    await CreatorCampaignMatchModel.deleteMany({
      campaignId: new Types.ObjectId(campaignId),
    }).exec();
  }
}
