export class ApiResponse<T> {
  readonly success = true as const;
  readonly message: string;
  readonly data: T;

  constructor(message: string, data: T) {
    this.message = message;
    this.data = data;
  }

  static success<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(message, data);
  }
}
