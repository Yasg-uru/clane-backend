import { z } from "zod";
import {
  CampaignPlatform,
  TargetGender,
  CampaignDeliveryType,
  CampaignStatus,
} from "@/types/campaign.types";

const MIN_DEADLINE_MS = 3 * 24 * 60 * 60 * 1000;

// ── Step 1 — Basics ──────────────────────────────────────────────────────────

export const step1Schema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters")
    .transform((v) => v.trim()),
  platform: z.enum([
    CampaignPlatform.INSTAGRAM,
    CampaignPlatform.YOUTUBE,
    CampaignPlatform.BOTH,
  ] as const),
  niche: z
    .array(z.string().min(1).max(30))
    .min(1, "Select at least one niche")
    .max(5, "You can select at most 5 niches"),
  targetLocation: z
    .string()
    .min(2, "Target location is required")
    .max(100)
    .transform((v) => v.trim()),
});

export type Step1Data = z.infer<typeof step1Schema>;

// ── Step 2 — Audience ────────────────────────────────────────────────────────

const instagramReqSchema = z
  .object({
    minFollowers: z.number().int().min(0).optional(),
    maxFollowers: z.number().int().min(0).optional(),
    minAvgReelViews: z.number().int().min(0).optional(),
    minEngagementRate: z.number().min(0).max(100).optional(),
    minPostsPerMonth: z.number().int().min(0).optional(),
  })
  .optional();

const youtubeReqSchema = z
  .object({
    minSubscribers: z.number().int().min(0).optional(),
    maxSubscribers: z.number().int().min(0).optional(),
    minAvgVideoViews: z.number().int().min(0).optional(),
    minVideosPerMonth: z.number().int().min(0).optional(),
  })
  .optional();

export const step2Schema = z
  .object({
    targetAgeMin: z.number().int().min(13, "Min age is 13").max(65, "Max age is 65"),
    targetAgeMax: z.number().int().min(13, "Min age is 13").max(65, "Max age is 65"),
    targetGender: z.enum([
      TargetGender.MALE,
      TargetGender.FEMALE,
      TargetGender.ANY,
    ] as const),
    creatorRequirements: z.object({
      instagram: instagramReqSchema,
      youtube: youtubeReqSchema,
      languages: z.array(z.string().min(1).max(50)).max(10).optional(),
    }),
  })
  .refine((d) => d.targetAgeMax >= d.targetAgeMin, {
    message: "Max age must be ≥ min age",
    path: ["targetAgeMax"],
  });

export type Step2Data = z.infer<typeof step2Schema>;

// ── Step 3 — Budget & Timeline ───────────────────────────────────────────────

export const step3Schema = z
  .object({
    budgetAmount: z
      .number()
      .int("Budget must be a whole number")
      .min(500, "Minimum budget is ₹500")
      .max(10_000_000, "Maximum budget is ₹1,00,00,000"),
    deadline: z
      .string()
      .min(1, "Deadline is required")
      .refine(
        (val) => new Date(val).getTime() >= Date.now() + MIN_DEADLINE_MS,
        "Deadline must be at least 3 days from now",
      ),
    deliveryType: z.enum([
      CampaignDeliveryType.ONSITE,
      CampaignDeliveryType.REMOTE,
    ] as const),
    shootingLat: z.string(),
    shootingLng: z.string(),
    shootingRadiusKm: z.string(),
  })
  .refine(
    (d) => {
      if (d.deliveryType === CampaignDeliveryType.ONSITE) {
        return d.shootingLat.trim().length > 0 && d.shootingLng.trim().length > 0;
      }
      return true;
    },
    {
      message: "Latitude and longitude are required for onsite campaigns",
      path: ["shootingLat"],
    },
  );

export type Step3Data = z.infer<typeof step3Schema>;

// ── Step 4 — Content Brief ───────────────────────────────────────────────────

export const step4Schema = z.object({
  contentBrief: z
    .string()
    .min(50, "Brief must be at least 50 characters")
    .max(2000, "Brief must be at most 2000 characters")
    .transform((v) => v.trim()),
  revisionRounds: z.union([z.literal(1), z.literal(2)]),
});

export type Step4Data = z.infer<typeof step4Schema>;

// ── Filters ──────────────────────────────────────────────────────────────────

export const brandListFiltersSchema = z.object({
  status: z
    .enum([
      CampaignStatus.DRAFT,
      CampaignStatus.ACTIVE,
      CampaignStatus.CLOSED,
      CampaignStatus.IN_PROGRESS,
      CampaignStatus.COMPLETED,
    ] as const)
    .optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type BrandListFiltersInput = z.infer<typeof brandListFiltersSchema>;
