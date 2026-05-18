import express, { type Application } from "express";
import { appRoutes } from "@/appRoutes";
import { applyMiddleware } from "@/middleware/applyMiddleware";

export function createApp(): Application {
  const app = express();

  applyMiddleware(app);
  appRoutes(app);

  return app;
}
