import type { ClientSession } from "mongoose";
import type { EscrowDocument, EscrowStatus, IEscrow } from "../../models/Escrow.model";
import type { PaginatedResult, WriteData } from "../types";
import type { IRepository } from "./IRepository";

export interface IEscrowRepository extends IRepository<EscrowDocument, IEscrow> {
  findByBidId(bidId: string): Promise<EscrowDocument | null>;
  findByRazorpayOrderId(orderId: string): Promise<EscrowDocument | null>;
  findByIdWithSecrets(id: string): Promise<EscrowDocument | null>;
  findByBrandId(brandId: string, page: number, limit: number, status?: EscrowStatus): Promise<PaginatedResult<EscrowDocument>>;
  findByCreatorId(creatorId: string, page: number, limit: number, status?: EscrowStatus): Promise<PaginatedResult<EscrowDocument>>;
  findPendingPaymentExpired(): Promise<EscrowDocument[]>;
  findFundedCollabExpired(): Promise<EscrowDocument[]>;
  appendWebhookEvent(escrowId: string, event: string, payload: Record<string, unknown>): Promise<void>;
  updateByIdWithSession(id: string, data: WriteData<IEscrow>, session: ClientSession): Promise<EscrowDocument | null>;
  startSession(): Promise<ClientSession>;
}
