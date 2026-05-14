import type { Application } from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";
import adminUsersRouter from "./routes/admin/users.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { requireRole } from "./middleware/requireRole.js";
import { Role } from "./generated/prisma/client.js";

export function appRoutes(app: Application): void {
  app.use("/api/health", healthRouter);
  app.use(
    "/api/admin/users",
    requireAuth,
    requireRole(Role.admin),
    adminUsersRouter
  );

  // Catch-all 404 — must be before the error handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Global error handler — must be registered last
  app.use(errorHandler);
}
