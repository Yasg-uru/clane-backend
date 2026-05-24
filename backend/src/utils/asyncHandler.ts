import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export class AsyncHandler {
  static wrap(handler: AsyncRequestHandler): RequestHandler {
    return (req, res, next) => {
      void Promise.resolve(handler(req, res, next)).catch(next);
    };
  }
}
