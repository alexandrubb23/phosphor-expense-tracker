import type { RequestHandler } from "express";
import { Role } from "@expense-tracker/core";
import { HttpForbiddenError } from "../lib/http-errors.js";

/**
 * Middleware factory that restricts a route to users holding one of the given roles.
 * Must be chained *after* requireAuth so that req.user is already populated.
 *
 * @example
 *   app.get("/api/admin/users", requireAuth, requireRole(Role.admin), handler);
 */
export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      return next(new HttpForbiddenError("Forbidden"));
    }
    next();
  };
