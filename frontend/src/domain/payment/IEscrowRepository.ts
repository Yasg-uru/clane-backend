import type { Escrow, PaginatedEscrows, RefreshLinkResult } from "@/types/payment.types";

export interface IEscrowRepository {
  listEscrows(): Promise<PaginatedEscrows>;
  getEscrow(escrowId: string): Promise<Escrow>;
  cancelEscrow(escrowId: string): Promise<Escrow>;
  refreshPaymentLink(escrowId: string): Promise<RefreshLinkResult>;
}
