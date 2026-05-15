import type { Request, Response, NextFunction } from "express";
import { env } from "../env.js";
import { HttpUnauthorizedError } from "../lib/http-errors.js";

/**
 * Verifies the webhook secret from either `X-Webhook-Secret` header or `?secret` query param.
 * If the env var is not set the check is skipped (useful in development).
 */
export function requireWebhookSecret(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const secret = env.WEBHOOK_SECRET;
  if (!secret) return next();

  const provided = req.headers["x-webhook-secret"] || req.query.secret;
  if (provided !== secret) {
    return next(new HttpUnauthorizedError("Invalid webhook secret"));
  }

  next();
}
