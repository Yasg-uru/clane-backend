import { AppError } from "./AppError";

export class UnprocessableError extends AppError {
  constructor(message = "Unprocessable entity", code?: string) {
    super(422, message, true, code);
  }
}
