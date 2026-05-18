import type { NextFunction, Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { HttpCodeError } from "@/lib/http-errors";

/**
 * Global Express error handler — must be registered as the last middleware.
 *
 * Catches any unhandled error forwarded by async route handlers and returns a
 * consistent JSON `{ error }` response, preventing stack traces or HTML error
 * pages from leaking internal details to clients.
 *
 * - `HttpCodeError` subclasses: respond with their status code and response body.
 * - Unknown errors: log and respond with a generic 500 message (never leaks
 *   internal details to the client).
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof HttpCodeError) {
    res.status(err.statusCode).json({ error: err.responseBody });
    return;
  }

  Sentry.captureException(err);
  console.error(err);

  res.status(500).json({ error: "Internal server error" });
};
