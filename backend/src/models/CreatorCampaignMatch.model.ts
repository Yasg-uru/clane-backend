import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export interface ICreatorCampaignMatch {
  creatorId: Types.ObjectId;
  campaignId: Types.ObjectId;
  matchScore: number;
  matchBreakdown: {
    nicheScore: number;
    platformScore: number;
    followerScore: number;
    locationScore: number;
    requirementsScore: number;
    proximityScore: number;
  };
  computedAt: Date;
}

export type CreatorCampaignMatchDocument = HydratedDocument<ICreatorCampaignMatch>;

const creatorCampaignMatchSchema = new Schema<ICreatorCampaignMatch>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: "Creator", required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    matchBreakdown: {
      nicheScore: { type: Number, required: true },
      platformScore: { type: Number, required: true },
      followerScore: { type: Number, required: true },
      locationScore: { type: Number, required: true },
      requirementsScore: { type: Number, required: true },
      proximityScore: { type: Number, required: true },
    },
    computedAt: { type: Date, required: true },
  },
  { timestamps: false },
);

creatorCampaignMatchSchema.index({ creatorId: 1, campaignId: 1 }, { unique: true });
creatorCampaignMatchSchema.index({ creatorId: 1, matchScore: -1 });

export const CreatorCampaignMatchModel = model<ICreatorCampaignMatch>(
  "CreatorCampaignMatch",
  creatorCampaignMatchSchema,
);
