import { logger } from "../utils/logger";

export abstract class BaseJob {
  private timer: NodeJS.Timeout | null = null;

  protected abstract readonly intervalMs: number;
  protected abstract run(): Promise<void>;

  start(): void {
    this.timer = setInterval(() => {
      this.run().catch((err: unknown) => {
        logger.error(`${this.constructor.name}: tick failed`, { err });
      });
    }, this.intervalMs);

    logger.info(`${this.constructor.name} started`, { intervalMs: this.intervalMs });
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    logger.info(`${this.constructor.name} stopped`);
  }
}
