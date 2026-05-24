import { AppError } from "./AppError";

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", code?: string) {
    super(429, message, true, code);
  }
}
