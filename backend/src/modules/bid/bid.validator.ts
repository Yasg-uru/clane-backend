import { z } from "zod";
import { MAX_COMPARE_BIDS, MAX_LIMIT } from "./bid.constants";
import { BidStatus } from "../../models/Bid.model";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

export const submitBidSchema = z.object({
  campaignId: objectIdSchema,
  proposedAmount: z
    .number()
    .int("Proposed amount must be an integer")
    .min(1, "Proposed amount must be at least ₹1")
    .max(10_000_000, "Proposed amount cannot exceed ₹1,00,00,000"),
  pitch: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().min(100, "Pitch must be at least 100 characters").max(1000, "Pitch must be at most 1000 characters"),
  ),
  attachmentUrl: z
    .string()
    .max(500, "URL too long")
    .regex(/^https?:\/\/.+/, "Attachment must be a valid URL starting with http:// or https://")
    .optional()
    .nullable(),
  proposedTimeline: z
    .number()
    .int("Timeline must be a whole number of days")
    .min(3, "Minimum timeline is 3 days")
    .max(60, "Maximum timeline is 60 days"),
});

export const withdrawBidSchema = z.object({
  withdrawReason: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().max(500, "Reason must be at most 500 characters").optional(),
  ),
});

export const declineBidSchema = z.object({
  declineReason: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().max(500, "Reason must be at most 500 characters").optional(),
  ),
});

export const getBidsSchema = z.object({
  status: z.nativeEnum(BidStatus).optional(),
  sortBy: z
    .enum(["amount_asc", "amount_desc", "match_score_desc", "submitted_at_desc"])
    .default("submitted_at_desc"),
  bidIds: z.preprocess(
    (val) => (typeof val === "string" ? val.split(",").map((s) => s.trim()) : val),
    z
      .array(objectIdSchema)
      .max(MAX_COMPARE_BIDS, `At most ${MAX_COMPARE_BIDS} bids can be compared`)
      .optional(),
  ),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
});

export const getCreatorBidsSchema = z.object({
  status: z.nativeEnum(BidStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
});

export const getNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
});

export type SubmitBidInput = z.infer<typeof submitBidSchema>;
export type WithdrawBidInput = z.infer<typeof withdrawBidSchema>;
export type DeclineBidInput = z.infer<typeof declineBidSchema>;
export type GetBidsInput = z.infer<typeof getBidsSchema>;
export type GetCreatorBidsInput = z.infer<typeof getCreatorBidsSchema>;
export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;
