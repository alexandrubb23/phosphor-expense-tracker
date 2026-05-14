import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import type { Application } from "express";
import express from "express";
import helmet from "helmet";
import { env } from "../env.js";
import { auth } from "../lib/auth.js";

export function applyMiddleware(app: Application): void {
  app.use(helmet());

  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

  // Better Auth handles its own body parsing — must be mounted before express.json()
  app.all("/api/auth/{*splat}", toNodeHandler(auth));

  app.use(express.json());
}
