import mongoose, { type ClientSession, type FilterQuery } from "mongoose";
import { EscrowModel, EscrowStatus, type EscrowDocument } from "../../models/Escrow.model";
import type { PaginatedResult } from "../../core/types";
import { BaseRepository } from "./BaseRepository";

export class EscrowRepository extends BaseRepository<EscrowDocument> {
  async findById(id: string): Promise<EscrowDocument | null> {
    return EscrowModel.findById(id).exec();
  }

  async create(data: Partial<Record<string, unknown>>): Promise<EscrowDocument> {
    const [escrow] = await EscrowModel.create([data]);
    if (!escrow) throw new Error("Failed to create escrow");
    return escrow;
  }

  async updateById(
    id: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<EscrowDocument | null> {
    return EscrowModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await EscrowModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async findByBidId(bidId: string): Promise<EscrowDocument | null> {
    return EscrowModel.findOne({ bidId }).exec();
  }

  async findByRazorpayOrderId(orderId: string): Promise<EscrowDocument | null> {
    return EscrowModel.findOne({ razorpayOrderId: orderId }).exec();
  }

  async findByIdWithSecrets(id: string): Promise<EscrowDocument | null> {
    return EscrowModel.findById(id).select("+razorpaySignature +webhookEvents").exec();
  }

  async findByBrandId(
    brandId: string,
    page: number,
    limit: number,
    status?: EscrowStatus,
  ): Promise<PaginatedResult<EscrowDocument>> {
    const query: FilterQuery<EscrowDocument> = { brandId };
    if (status) query.status = status;

    const [total, items] = await Promise.all([
      EscrowModel.countDocuments(query),
      EscrowModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
    ]);

    return this.buildPaginatedResult(items, total, page, limit);
  }

  async findByCreatorId(
    creatorId: string,
    page: number,
    limit: number,
    status?: EscrowStatus,
  ): Promise<PaginatedResult<EscrowDocument>> {
    const query: FilterQuery<EscrowDocument> = { creatorId };
    if (status) query.status = status;

    const [total, items] = await Promise.all([
      EscrowModel.countDocuments(query),
      EscrowModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
    ]);

    return this.buildPaginatedResult(items, total, page, limit);
  }

  async findPendingPaymentExpired(): Promise<EscrowDocument[]> {
    return EscrowModel.find({
      status: EscrowStatus.AwaitingPayment,
      paymentDeadline: { $lt: new Date() },
    }).exec();
  }

  async findFundedCollabExpired(): Promise<EscrowDocument[]> {
    return EscrowModel.find({
      status: EscrowStatus.Funded,
      collabDeadline: { $lt: new Date() },
    }).exec();
  }

  async appendWebhookEvent(
    escrowId: string,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await EscrowModel.updateOne(
      { _id: escrowId },
      {
        $push: {
          webhookEvents: {
            event,
            receivedAt: new Date(),
            payload,
          },
        },
      },
    ).exec();
  }

  async updateByIdWithSession(
    id: string,
    data: Partial<Record<string, unknown>>,
    session: ClientSession,
  ): Promise<EscrowDocument | null> {
    return EscrowModel.findByIdAndUpdate(id, data, { new: true, session }).exec();
  }

  async startSession(): Promise<ClientSession> {
    return mongoose.startSession();
  }
}
