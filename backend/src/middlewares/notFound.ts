import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};
