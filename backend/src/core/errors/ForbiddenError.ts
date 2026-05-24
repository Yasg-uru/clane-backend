import { AppError } from "./AppError";

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code?: string) {
    super(403, message, true, code);
  }
}
