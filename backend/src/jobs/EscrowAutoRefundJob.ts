import type { EscrowRepository } from "../infrastructure/repositories/EscrowRepository";
import type { EscrowService } from "../modules/escrow/EscrowService";
import { AUTO_REFUND_JOB_INTERVAL_MS } from "../modules/escrow/escrow.constants";
import { logger } from "../utils/logger";

export class EscrowAutoRefundJob {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly escrowRepository: EscrowRepository,
    private readonly escrowService: EscrowService,
  ) {}

  start(): void {
    this.timer = setInterval(() => {
      this.run().catch((err: unknown) => {
        logger.error("EscrowAutoRefundJob: tick failed", { err });
      });
    }, AUTO_REFUND_JOB_INTERVAL_MS);

    logger.info("EscrowAutoRefundJob started", { intervalMs: AUTO_REFUND_JOB_INTERVAL_MS });
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    logger.info("EscrowAutoRefundJob stopped");
  }

  private async run(): Promise<void> {
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
