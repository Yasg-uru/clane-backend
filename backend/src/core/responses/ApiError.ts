export class ErrorResponse {
  readonly success = false as const;
  readonly message: string;
  readonly code?: string;
  readonly errors?: unknown[];

  private constructor(message: string, code?: string, errors?: unknown[]) {
    this.message = message;
    if (code) this.code = code;
    if (errors?.length) this.errors = errors;
  }

  static build(message: string, code?: string, errors?: unknown[]): ErrorResponse {
    return new ErrorResponse(message, code, errors);
  }
}
