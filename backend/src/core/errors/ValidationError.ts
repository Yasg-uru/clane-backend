import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message = "Validation failed", code?: string) {
    super(400, message, true, code);
  }
}
