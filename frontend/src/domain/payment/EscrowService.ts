import { normalizeError } from "@/lib/api/error-handler";
import type { Escrow, PaginatedEscrows, RefreshLinkResult } from "@/types/payment.types";
import type { IEscrowRepository } from "./IEscrowRepository";

export class EscrowService {
  constructor(private readonly repo: IEscrowRepository) {}

  async listEscrows(): Promise<PaginatedEscrows> {
    try {
      return await this.repo.listEscrows();
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getEscrow(escrowId: string): Promise<Escrow> {
    try {
      return await this.repo.getEscrow(escrowId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async cancelEscrow(escrowId: string): Promise<Escrow> {
    try {
      return await this.repo.cancelEscrow(escrowId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async refreshPaymentLink(escrowId: string): Promise<RefreshLinkResult> {
    try {
      return await this.repo.refreshPaymentLink(escrowId);
    } catch (error) {
      throw normalizeError(error);
    }
  }
}
