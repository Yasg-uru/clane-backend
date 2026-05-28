import type { Request, Response } from "express";
import { AuthError } from "../../core/errors/AuthError";
import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import { logger } from "../../utils/logger";
import type { EscrowService } from "./EscrowService";
import { escrowListQuerySchema } from "./escrow.validator";
import { UserRole } from "../../core/types";
import { toParam } from "../../utils/requestParam";

export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  // ─── Role-aware read endpoints ────────────────────────────────────────────

  getEscrow = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const escrowId = toParam(req.params["escrowId"]);
    if (!escrowId) throw new AuthError("Unauthorized");
    const escrow =
      req.user.role === UserRole.Brand
        ? await this.escrowService.getEscrowForBrand(req.user.userId, escrowId)
        : await this.escrowService.getEscrowForCreator(req.user.userId, escrowId);
    res.status(200).json(new ApiResponse("Escrow retrieved", { escrow }));
  });

  listEscrows = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const { page, limit } = escrowListQuerySchema.parse(req.query);
    const result =
      req.user.role === UserRole.Brand
        ? await this.escrowService.getBrandEscrows(req.user.userId, page, limit)
        : await this.escrowService.getCreatorEscrows(req.user.userId, page, limit);
    res.status(200).json(new ApiResponse("Escrows retrieved", result));
  });

  // ─── Brand actions ────────────────────────────────────────────────────────

  cancelEscrow = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const escrowId = toParam(req.params["escrowId"]);
    if (!escrowId) throw new AuthError("Unauthorized");
    const escrow = await this.escrowService.cancelEscrow(req.user.userId, escrowId);
    res.status(200).json(new ApiResponse("Escrow cancelled", { escrow }));
  });

  refreshPaymentLink = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const escrowId = toParam(req.params["escrowId"]);
    if (!escrowId) throw new AuthError("Unauthorized");
    const razorpayOrderId = await this.escrowService.refreshPaymentLink(req.user.userId, escrowId);
    res.status(200).json(new ApiResponse("Payment link refreshed", { razorpayOrderId }));
  });

  // ─── Razorpay webhook ─────────────────────────────────────────────────────
  //
  // Bound to express.raw() middleware on the route. Returns 200 even on
  // signature failure so Razorpay does not retry indefinitely.

  handleRazorpayWebhook = (req: Request, res: Response): void => {
    void this.runWebhook(req, res);
  };

  private async runWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.header("x-razorpay-signature") ?? "";
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : "";

    try {
      await this.escrowService.handlePaymentWebhook(rawBody, signature);
      res.status(200).json({ success: true });
    } catch (err) {
      logger.error("EscrowController: webhook processing error", { err });
      res.status(200).json({ success: true });
    }
  }
}
