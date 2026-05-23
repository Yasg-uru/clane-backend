import path from "path";
import { createLogger, format, transports } from "winston";

const isProduction = process.env.NODE_ENV === "production";

const devFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.colorize(),
  format.printf(({ level, message, timestamp, stack }) => {
    const errorStack = typeof stack === "string" ? `\n${stack}` : "";
    return `${String(timestamp)} ${level}: ${String(message)}${errorStack}`;
  }),
);

const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json(),
);

export const logger = createLogger({
  level: isProduction ? "info" : (process.env.LOG_LEVEL ?? "debug"),
  format: isProduction ? prodFormat : devFormat,
  transports: isProduction
    ? [
        new transports.Console(),
        new transports.File({ filename: path.join("logs", "error.log"), level: "error" }),
        new transports.File({ filename: path.join("logs", "combined.log") }),
      ]
    : [new transports.Console()],
});
