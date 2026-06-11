import type { Request } from "express";
import { AuthError } from "../core/errors/AuthError";
import { ValidationError } from "../core/errors/ValidationError";
import type { JwtPayload } from "../core/types";
import { toParam } from "./requestParam";

/**
 * Returns the authenticated principal, narrowing `req.user` to a non-optional
 * `JwtPayload`. Use in handlers mounted behind an auth middleware so the
 * repeated `if (!req.user) throw …` guard lives in exactly one place.
 */
export function requireUser(req: Request): JwtPayload {
  if (!req.user) throw new AuthError("Unauthorized");
  return req.user;
}

/**
 * Extracts a required route/query param. A missing param is a client error
 * (400 ValidationError) — not an auth failure.
 */
export function requireParam(req: Request, name: string): string {
  const value = toParam(req.params[name]);
  if (!value) {
    throw new ValidationError(`Missing required parameter: ${name}`, "INVALID_ROUTE_PARAMS");
  }
  return value;
}
