import express from "express";
import cors from "cors";
import { env } from "./env.js";
import healthRouter from "./routes/health.js";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/api/health", healthRouter);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

export default app;
