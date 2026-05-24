import { AppError } from "./AppError";

export class ConflictError extends AppError {
  constructor(message = "Conflict", code?: string) {
    super(409, message, true, code);
  }
}
