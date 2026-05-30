import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly errors?: ApiErrorResponse["errors"];

  constructor(
    message: string,
    status: number,
    code?: string,
    errors?: ApiErrorResponse["errors"],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isRateLimit(): boolean {
    return this.status === 429;
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError<ApiErrorResponse>(error)) {
    const response = error.response;
    if (response) {
      const { message, code, errors } = response.data;
      return new ApiError(message ?? "An error occurred", response.status, code, errors);
    }
    return new ApiError("Network error — please check your connection", 0);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 0);
  }

  return new ApiError("An unexpected error occurred", 0);
}
