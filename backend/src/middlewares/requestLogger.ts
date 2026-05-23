import type { RequestHandler } from "express";
import { logger } from "../utils/logger";

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(2)}ms`,
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        response_time_ms: Number(durationMs.toFixed(2)),
        ip: req.ip,
      },
    );
  });

  next();
};
