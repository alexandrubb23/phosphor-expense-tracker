import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express, { type Router } from "express";

export function serveClient(): Router {
  const router = express.Router();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.resolve(__dirname, "../../../frontend/dist");

  if (existsSync(distPath)) {
    router.use(express.static(distPath));

    // SPA fallback: non-API routes return index.html so React Router works
    router.get(/^(?!\/api)/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return router;
}
