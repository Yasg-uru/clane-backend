import { apiClient } from "@/lib/api/client";
import { ESCROW_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types";
import type { Escrow, PaginatedEscrows, RefreshLinkResult } from "@/types/payment.types";
import type { IEscrowRepository } from "./IEscrowRepository";

export class EscrowRepository implements IEscrowRepository {
  async listEscrows(): Promise<PaginatedEscrows> {
    const response = await apiClient.get<ApiResponse<PaginatedEscrows>>(ESCROW_ENDPOINTS.list);
    return response.data.data;
  }

  async getEscrow(escrowId: string): Promise<Escrow> {
    const response = await apiClient.get<ApiResponse<{ escrow: Escrow }>>(
      ESCROW_ENDPOINTS.detail(escrowId),
    );
    return response.data.data.escrow;
  }

  async cancelEscrow(escrowId: string): Promise<Escrow> {
    const response = await apiClient.post<ApiResponse<{ escrow: Escrow }>>(
      ESCROW_ENDPOINTS.cancel(escrowId),
    );
    return response.data.data.escrow;
  }

  async refreshPaymentLink(escrowId: string): Promise<RefreshLinkResult> {
    const response = await apiClient.post<ApiResponse<RefreshLinkResult>>(
      ESCROW_ENDPOINTS.refreshLink(escrowId),
    );
    return response.data.data;
  }
}
