import type { RequestHandler } from "express";
import { NotFoundError } from "../../core/errors/NotFoundError";

export class NotFoundMiddleware {
  handle: RequestHandler = (req, _res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} not found`));
  };
}
