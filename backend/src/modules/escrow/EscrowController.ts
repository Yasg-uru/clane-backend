import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import { requireParam, requireUser } from "../../utils/httpContext";
import { logger } from "../../utils/logger";
import type { EscrowService } from "./EscrowService";
import { escrowListQuerySchema } from "./escrow.validator";
import { UserRole } from "../../core/types";

export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  // ─── Role-aware read endpoints ────────────────────────────────────────────

  getEscrow = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const escrowId = requireParam(req, "escrowId");
    const escrow =
      user.role === UserRole.Brand
        ? await this.escrowService.getEscrowForBrand(user.userId, escrowId)
        : await this.escrowService.getEscrowForCreator(user.userId, escrowId);
    res.status(200).json(new ApiResponse("Escrow retrieved", { escrow }));
  });

  listEscrows = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const { page, limit } = escrowListQuerySchema.parse(req.query);
    const result =
      user.role === UserRole.Brand
        ? await this.escrowService.getBrandEscrows(user.userId, page, limit)
        : await this.escrowService.getCreatorEscrows(user.userId, page, limit);
    res.status(200).json(new ApiResponse("Escrows retrieved", result));
  });

  // ─── Brand actions ────────────────────────────────────────────────────────

  cancelEscrow = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const escrowId = requireParam(req, "escrowId");
    const escrow = await this.escrowService.cancelEscrow(user.userId, escrowId);
    res.status(200).json(new ApiResponse("Escrow cancelled", { escrow }));
  });

  refreshPaymentLink = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const escrowId = requireParam(req, "escrowId");
    const razorpayOrderId = await this.escrowService.refreshPaymentLink(user.userId, escrowId);
    res.status(200).json(new ApiResponse("Payment link refreshed", { razorpayOrderId }));
  });

  // ─── Razorpay webhook ─────────────────────────────────────────────────────
  //
  // Bound to express.raw() middleware on the route. Always responds 200 — even
  // on signature/processing failure — so Razorpay does not retry indefinitely.

  handleRazorpayWebhook = AsyncHandler.wrap(async (req, res) => {
    const signature = req.header("x-razorpay-signature") ?? "";
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : "";

    try {
      await this.escrowService.handlePaymentWebhook(rawBody, signature);
    } catch (err) {
      logger.error("EscrowController: webhook processing error", { err });
    }

    res.status(200).json({ success: true });
  });
}
