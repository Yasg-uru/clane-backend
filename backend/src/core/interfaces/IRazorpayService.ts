import type { Orders } from "razorpay/dist/types/orders";
import type { Payments } from "razorpay/dist/types/payments";
import type { Refunds } from "razorpay/dist/types/refunds";
import type { Transfers } from "razorpay/dist/types/transfers";
import type {
  CreateOrderParams,
  InitiateRefundParams,
  TransferParams,
} from "../../infrastructure/services/razorpay.types";

export interface IRazorpayService {
  createOrder(params: CreateOrderParams): Promise<Orders.RazorpayOrder>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  fetchPayment(paymentId: string): Promise<Payments.RazorpayPayment>;
  initiateRefund(params: InitiateRefundParams): Promise<Refunds.RazorpayRefund>;
  createTransfer(params: TransferParams): Promise<Transfers.RazorpayTransfer>;
}
