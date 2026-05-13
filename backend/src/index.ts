import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { authHandler } from "./routes/auth.js";
import healthRouter from "./routes/health.js";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

// Better Auth handles its own body parsing — must be mounted before express.json()
app.all("/api/auth/{*splat}", authHandler);

app.use(express.json());

app.use("/api/health", healthRouter);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

export default app;
