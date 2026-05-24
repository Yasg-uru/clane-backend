import { AppError } from "./AppError";

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", code?: string) {
    super(503, message, false, code);
  }
}
