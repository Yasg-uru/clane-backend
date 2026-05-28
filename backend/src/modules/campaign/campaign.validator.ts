import { z } from "zod";
import { MIN_DEADLINE_MS } from "./campaign.constants";
import { CampaignPlatform, TargetGender, CampaignDeliveryType, CampaignStatus } from "../../models/Campaign.model";

const trimmedString = (min: number, max: number, label: string) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().min(min, `${label} must be at least ${min} characters`).max(max, `${label} must be at most ${max} characters`),
  );

const positiveInt = z.number().int().min(0);

const geoPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90),   // latitude
  ]),
});

const shootingLocationSchema = z.object({
  geo: geoPointSchema,
  radiusKm: z.number().int().min(0).max(500).optional(),
});

const instagramRequirementsSchema = z.object({
  minFollowers: positiveInt.optional(),
  maxFollowers: positiveInt.optional(),
  minAvgReelViews: positiveInt.optional(),
  minAvgPostLikes: positiveInt.optional(),
  minEngagementRate: z.number().min(0).max(100).optional(),
  minPostsPerMonth: positiveInt.optional(),
}).optional();

const youtubeRequirementsSchema = z.object({
  minSubscribers: positiveInt.optional(),
  maxSubscribers: positiveInt.optional(),
  minAvgVideoViews: positiveInt.optional(),
  minAvgLikes: positiveInt.optional(),
  minVideosPerMonth: positiveInt.optional(),
}).optional();

const creatorRequirementsSchema = z.object({
  instagram: instagramRequirementsSchema,
  youtube: youtubeRequirementsSchema,
  minAge: z.number().int().min(13).max(65).optional(),
  maxAge: z.number().int().min(13).max(65).optional(),
  gender: z.nativeEnum(TargetGender).optional(),
  languages: z.array(z.string().min(1).max(50)).max(10).optional(),
}).optional();

export const createCampaignSchema = z
  .object({
    title: trimmedString(3, 100, "Title"),
    platform: z.nativeEnum(CampaignPlatform),
    niche: z
      .array(z.string().min(1).max(30))
      .min(1, "At least one niche is required")
      .max(5, "At most 5 niches allowed"),
    targetLocation: trimmedString(2, 100, "Target location"),
    targetAgeMin: z.number().int("Must be an integer").min(13).max(65),
    targetAgeMax: z.number().int("Must be an integer").min(13).max(65),
    targetGender: z.nativeEnum(TargetGender),
    budgetAmount: z
      .number()
      .int("Budget must be an integer")
      .min(500, "Minimum budget is ₹500")
      .max(10_000_000, "Maximum budget is ₹1,00,00,000"),
    deadline: z.coerce
      .date()
      .refine(
        (val) => val >= new Date(Date.now() + MIN_DEADLINE_MS),
        "Deadline must be at least 3 days from now",
      ),
    contentBrief: trimmedString(50, 2000, "Content brief"),
    revisionRounds: z.union([z.literal(1), z.literal(2)]),
    deliveryType: z.nativeEnum(CampaignDeliveryType),
    shootingLocation: shootingLocationSchema.optional(),
    creatorRequirements: creatorRequirementsSchema,
  })
  .refine(
    (data) => data.targetAgeMax >= data.targetAgeMin,
    { message: "targetAgeMax must be greater than or equal to targetAgeMin", path: ["targetAgeMax"] },
  )
  .refine(
    (data) => data.deliveryType !== CampaignDeliveryType.Onsite || !!data.shootingLocation,
    { message: "Shooting location is required for onsite campaigns", path: ["shootingLocation"] },
  );

export const updateCampaignSchema = createCampaignSchema
  .partial()
  .refine(
    (data) => {
      if (data.targetAgeMin !== undefined && data.targetAgeMax !== undefined) {
        return data.targetAgeMax >= data.targetAgeMin;
      }
      return true;
    },
    { message: "targetAgeMax must be greater than or equal to targetAgeMin", path: ["targetAgeMax"] },
  )
  .refine(
    (data) => {
      if (data.deliveryType === CampaignDeliveryType.Onsite) {
        return !!data.shootingLocation;
      }
      return true;
    },
    { message: "Shooting location is required for onsite campaigns", path: ["shootingLocation"] },
  );

export const browseFiltersSchema = z
  .object({
    platform: z.nativeEnum(CampaignPlatform).optional(),
    niche: z
      .preprocess(
        (val) => (typeof val === "string" ? [val] : val),
        z.array(z.string().max(30)).optional(),
      ),
    budgetMin: z.coerce.number().int().min(0).optional(),
    budgetMax: z.coerce.number().int().min(0).optional(),
    deliveryType: z.nativeEnum(CampaignDeliveryType).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .refine(
    (data) => {
      if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
        return data.budgetMax >= data.budgetMin;
      }
      return true;
    },
    { message: "budgetMax must be >= budgetMin", path: ["budgetMax"] },
  );

export const brandListFiltersSchema = z.object({
  status: z.nativeEnum(CampaignStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type BrowseFiltersInput = z.infer<typeof browseFiltersSchema>;
export type BrandListFiltersInput = z.infer<typeof brandListFiltersSchema>;
