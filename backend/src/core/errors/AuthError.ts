import { AppError } from "./AppError";

export class AuthError extends AppError {
  constructor(message = "Unauthorized", code?: string) {
    super(401, message, true, code);
  }
}
