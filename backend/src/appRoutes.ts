import { type Application } from "express";
import * as Sentry from "@sentry/node";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";
import adminUsersRouter from "./routes/admin/users.js";
import whitelistRouter from "./routes/whitelist.js";
import transactionsRouter from "./routes/transactions/index.js";
import emailWebhookRouter from "./routes/webhooks/email.js";
import { requireWebhookSecret } from "./middleware/requireWebhookSecret.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { requireRole } from "./middleware/requireRole.js";
import { serveClient } from "./middleware/serveClient.js";
import { Role } from "@expense-tracker/core";

export function appRoutes(app: Application): void {
  app.use("/api/health", healthRouter);

  // Public webhook — secret verified via X-Webhook-Secret header
  app.use(
    "/api/webhooks/inbound-email",
    requireWebhookSecret,
    emailWebhookRouter
  );

  app.use(
    "/api/admin/users",
    requireAuth,
    requireRole(Role.admin),
    adminUsersRouter
  );

  app.use("/api/whitelist", requireAuth, whitelistRouter);
  app.use("/api/transactions", requireAuth, transactionsRouter);

  app.use(serveClient());

  // API 404 — must be before the error handler
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Sentry error handler — must be before the custom error handler
  Sentry.setupExpressErrorHandler(app);

  // Global error handler — must be registered last
  app.use(errorHandler);
}
