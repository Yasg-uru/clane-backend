import type { IEscrowRepository } from "../core/interfaces/IEscrowRepository";
import type { EscrowService } from "../modules/escrow/EscrowService";
import { AUTO_REFUND_JOB_INTERVAL_MS } from "../modules/escrow/escrow.constants";
import { logger } from "../utils/logger";
import { BaseJob } from "./BaseJob";

export class EscrowAutoRefundJob extends BaseJob {
  protected readonly intervalMs = AUTO_REFUND_JOB_INTERVAL_MS;

  constructor(
    private readonly escrowRepository: IEscrowRepository,
    private readonly escrowService: EscrowService,
  ) {
    super();
  }

  protected async run(): Promise<void> {
    const expired = await this.escrowRepository.findFundedCollabExpired();
    if (expired.length === 0) return;

    logger.info("EscrowAutoRefundJob: expired collabs found", { count: expired.length });

    for (const escrow of expired) {
      try {
        await this.escrowService.initiateAutoRefund(escrow._id.toString());
      } catch (err) {
        logger.error("EscrowAutoRefundJob: failed to initiate refund", {
          escrowId: escrow._id.toString(),
          err,
        });
      }
    }
  }
}
