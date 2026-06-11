import { z } from "zod";
import { CreatorPlatform } from "./creator.types";

export const creatorBrowseFiltersSchema = z
  .object({
    niche: z.preprocess(
      (val) => (typeof val === "string" ? [val] : val),
      z.array(z.string().min(1).max(30)).max(5).optional(),
    ),
    platform: z.nativeEnum(CreatorPlatform).optional(),
    city: z.string().min(1).max(100).optional(),
    followersMin: z.coerce.number().int().min(0).optional(),
    followersMax: z.coerce.number().int().min(0).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .refine(
    (data) =>
      data.followersMin === undefined ||
      data.followersMax === undefined ||
      data.followersMax >= data.followersMin,
    { message: "followersMax must be >= followersMin", path: ["followersMax"] },
  );

export type CreatorBrowseInput = z.infer<typeof creatorBrowseFiltersSchema>;
