import { z } from "zod";

export const submitBidSchema = z.object({
  campaignId: z.string().min(1, "Campaign is required"),
  proposedAmount: z
    .number()
    .int("Amount must be a whole number")
    .min(500, "Minimum bid amount is ₹500"),
  pitch: z
    .string()
    .min(20, "Pitch must be at least 20 characters")
    .max(1000, "Pitch cannot exceed 1000 characters"),
  proposedTimeline: z
    .number()
    .int("Timeline must be a whole number")
    .min(1, "Minimum timeline is 1 day")
    .max(90, "Maximum timeline is 90 days"),
  attachmentUrl: z.string().refine((v) => !v || v.startsWith("http"), "Invalid attachment URL"),
});

export type SubmitBidFormValues = z.infer<typeof submitBidSchema>;
