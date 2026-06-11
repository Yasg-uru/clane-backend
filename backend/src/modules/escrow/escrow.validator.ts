import { z } from "zod";
import { ESCROW_LIST_LIMIT_DEFAULT, ESCROW_LIST_LIMIT_MAX } from "./escrow.constants";

export const escrowListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(ESCROW_LIST_LIMIT_MAX).default(ESCROW_LIST_LIMIT_DEFAULT),
});

export type EscrowListQuery = z.infer<typeof escrowListQuerySchema>;

export const verifyPaymentBodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type VerifyPaymentBody = z.infer<typeof verifyPaymentBodySchema>;
