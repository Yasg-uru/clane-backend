import { z } from "zod";
import { ESCROW_LIST_LIMIT_DEFAULT, ESCROW_LIST_LIMIT_MAX } from "./escrow.constants";

export const escrowListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(ESCROW_LIST_LIMIT_MAX).default(ESCROW_LIST_LIMIT_DEFAULT),
});

export type EscrowListQuery = z.infer<typeof escrowListQuerySchema>;
