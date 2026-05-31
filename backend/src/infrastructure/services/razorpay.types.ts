export interface RazorpayServiceConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  accountNumber: string;
}

export interface CreateOrderParams {
  amount: number;
  currency: "INR";
  receipt: string;
  notes: {
    bidId: string;
    campaignId: string;
    brandId: string;
    creatorId: string;
    platformFee: number;
  };
}

export interface InitiateRefundParams {
  paymentId: string;
  amount: number;
  notes: Record<string, string>;
}

export interface TransferParams {
  paymentId: string;
  amount: number;
  currency: "INR";
  accountId: string;
  notes: Record<string, string>;
}
