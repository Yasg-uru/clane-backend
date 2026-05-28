import type { EscrowRepository } from "../infrastructure/repositories/EscrowRepository";
import type { EscrowService } from "../modules/escrow/EscrowService";
import { PAYMENT_TIMEOUT_JOB_INTERVAL_MS } from "../modules/escrow/escrow.constants";
import { logger } from "../utils/logger";

export class EscrowPaymentTimeoutJob {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly escrowRepository: EscrowRepository,
    private readonly escrowService: EscrowService,
  ) {}

  start(): void {
    this.timer = setInterval(() => {
      this.run().catch((err: unknown) => {
        logger.error("EscrowPaymentTimeoutJob: tick failed", { err });
      });
    }, PAYMENT_TIMEOUT_JOB_INTERVAL_MS);

    logger.info("EscrowPaymentTimeoutJob started", { intervalMs: PAYMENT_TIMEOUT_JOB_INTERVAL_MS });
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    logger.info("EscrowPaymentTimeoutJob stopped");
  }

  private async run(): Promise<void> {
    const expired = await this.escrowRepository.findPendingPaymentExpired();
    if (expired.length === 0) return;

    logger.info("EscrowPaymentTimeoutJob: expired escrows found", { count: expired.length });

    let succeeded = 0;
    let failed = 0;

    for (const escrow of expired) {
      const session = await this.escrowService.startSession();
      try {
        session.startTransaction();
        const { campaignTitle } = await this.escrowService.expirePendingPayment(escrow, session);
        await session.commitTransaction();
        await this.escrowService.publishPaymentTimeoutNotifications(escrow, campaignTitle);
        succeeded += 1;
      } catch (err) {
        await session.abortTransaction().catch(() => undefined);
        logger.error("EscrowPaymentTimeoutJob: failed to expire escrow", {
          escrowId: escrow._id.toString(),
          err,
        });
        failed += 1;
      } finally {
        await session.endSession();
      }
    }

    logger.info("EscrowPaymentTimeoutJob: tick completed", { succeeded, failed });
  }
}
