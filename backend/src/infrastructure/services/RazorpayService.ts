import crypto from "crypto";
import Razorpay from "razorpay";
import type { Orders } from "razorpay/dist/types/orders";
import type { Payments } from "razorpay/dist/types/payments";
import type { Refunds } from "razorpay/dist/types/refunds";
import type { Transfers } from "razorpay/dist/types/transfers";
import { ServiceUnavailableError } from "../../core/errors/ServiceUnavailableError";
import { logger } from "../../utils/logger";
import type { RazorpayServiceConfig, CreateOrderParams, InitiateRefundParams, TransferParams } from "./razorpay.types";

export type { RazorpayServiceConfig, CreateOrderParams, InitiateRefundParams, TransferParams };

export class RazorpayService {
  private readonly client: Razorpay;
  private readonly webhookSecret: string;

  constructor(config: RazorpayServiceConfig) {
    this.client = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    });
    this.webhookSecret = config.webhookSecret;
  }

  async createOrder(params: CreateOrderParams): Promise<Orders.RazorpayOrder> {
    try {
      return await this.client.orders.create({
        amount: params.amount,
        currency: params.currency,
        receipt: params.receipt,
        notes: {
          bidId: params.notes.bidId,
          campaignId: params.notes.campaignId,
          brandId: params.notes.brandId,
          creatorId: params.notes.creatorId,
          platformFee: params.notes.platformFee,
        },
      });
    } catch (err) {
      logger.error("RazorpayService: createOrder failed", { err, receipt: params.receipt });
      throw new ServiceUnavailableError("Razorpay order creation failed", "RAZORPAY_API_ERROR");
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== signatureBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  }

  async fetchPayment(paymentId: string): Promise<Payments.RazorpayPayment> {
    try {
      return await this.client.payments.fetch(paymentId);
    } catch (err) {
      logger.error("RazorpayService: fetchPayment failed", { err, paymentId });
      throw new ServiceUnavailableError("Razorpay payment fetch failed", "RAZORPAY_API_ERROR");
    }
  }

  async initiateRefund(params: InitiateRefundParams): Promise<Refunds.RazorpayRefund> {
    try {
      return await this.client.payments.refund(params.paymentId, {
        amount: params.amount,
        notes: params.notes,
      });
    } catch (err) {
      logger.error("RazorpayService: initiateRefund failed", { err, paymentId: params.paymentId });
      throw new ServiceUnavailableError("Razorpay refund failed", "RAZORPAY_API_ERROR");
    }
  }

  // Phase 6 will implement actual transfer; signature defined now for stability.
  async createTransfer(params: TransferParams): Promise<Transfers.RazorpayTransfer> {
    try {
      const result = await this.client.payments.transfer(params.paymentId, {
        transfers: [
          {
            account: params.accountId,
            amount: params.amount,
            currency: params.currency,
            notes: params.notes,
          },
        ],
      });
      const [transfer] = result.items;
      if (!transfer) throw new Error("Razorpay returned no transfer items");
      return transfer;
    } catch (err) {
      logger.error("RazorpayService: createTransfer failed", { err, paymentId: params.paymentId });
      throw new ServiceUnavailableError("Razorpay transfer failed", "RAZORPAY_API_ERROR");
    }
  }
}
