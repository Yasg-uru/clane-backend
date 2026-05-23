import type { ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown[];
}

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

const isMongoDuplicateKeyError = (
  error: unknown,
): error is MongoDuplicateKeyError => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { code?: unknown };
  return candidate.code === 11000;
};

const isProduction = process.env.NODE_ENV === "production";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown[] | undefined;

  logger.error("Request failed", {
    method: req.method,
    url: req.originalUrl,
    error,
    stack: error instanceof Error ? error.stack : undefined,
  });

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors.length > 0 ? error.errors : undefined;
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(error.errors).map((item) => item.message);
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource identifier";
  } else if (isMongoDuplicateKeyError(error)) {
    statusCode = 409;
    message = "Duplicate field value";
  } else if (error instanceof ZodError) {
    statusCode = 422;
    message = "Validation failed";
    errors = error.issues;
  } else if (error instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token expired";
  } else if (error instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Unauthorized";
  } else if (error instanceof Error) {
    // [HIGH] Never expose internal error messages to clients in production.
    if (!isProduction) {
      message = error.message || message;
    }
  }

  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};
