import { z } from "zod";
import { ESCROW_LIST_LIMIT_DEFAULT, ESCROW_LIST_LIMIT_MAX } from "./escrow.constants";

export const escrowListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(ESCROW_LIST_LIMIT_MAX).default(ESCROW_LIST_LIMIT_DEFAULT),
});

export const collabListQuerySchema = z.object({
  status: z
    .enum([
      "pending_chat",
      "active",
      "content_submitted",
      "under_review",
      "revision_requested",
      "approved",
      "completed",
      "disputed",
    ])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(ESCROW_LIST_LIMIT_MAX).default(ESCROW_LIST_LIMIT_DEFAULT),
});

export type EscrowListQuery = z.infer<typeof escrowListQuerySchema>;
export type CollabListQuery = z.infer<typeof collabListQuerySchema>;
