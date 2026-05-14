import express, { type Application } from "express";
import { appRoutes } from "./appRoutes.js";
import { applyMiddleware } from "./middleware/applyMiddleware.js";

export function createApp(): Application {
  const app = express();

  applyMiddleware(app);
  appRoutes(app);

  return app;
}
