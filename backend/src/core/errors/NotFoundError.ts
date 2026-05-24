import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(message = "Not found", code?: string) {
    super(404, message, true, code);
  }
}
