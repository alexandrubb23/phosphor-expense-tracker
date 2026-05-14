import type { Application } from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";

export function appRoutes(app: Application): void {
  app.use("/api/health", healthRouter);

  // Catch-all 404 — must be before the error handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Global error handler — must be registered last
  app.use(errorHandler);
}
