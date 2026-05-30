import type { RequestHandler } from "express";
import type { AsyncRequestHandler } from "./asyncHandler.types";

export class AsyncHandler {
  static wrap(handler: AsyncRequestHandler): RequestHandler {
    return (req, res, next) => {
      void Promise.resolve(handler(req, res, next)).catch(next);
    };
  }
}
