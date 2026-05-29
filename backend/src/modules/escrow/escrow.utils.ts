import { PLATFORM_FEE_RATIO, PAISE_PER_RUPEE } from "./escrow.constants";

export interface EscrowAmounts {
  agreedAmount: number;
  platformFeeAmount: number;
  totalChargedAmount: number;
  creatorReceivableAmount: number;
}

export class EscrowUtils {
  static calculateAmounts(proposedAmountRupees: number): EscrowAmounts {
    const agreedAmount = proposedAmountRupees * PAISE_PER_RUPEE;
    const platformFeeAmount = Math.round(agreedAmount * PLATFORM_FEE_RATIO);
    const totalChargedAmount = agreedAmount + platformFeeAmount;
    const creatorReceivableAmount = agreedAmount;
    return { agreedAmount, platformFeeAmount, totalChargedAmount, creatorReceivableAmount };
  }
}
