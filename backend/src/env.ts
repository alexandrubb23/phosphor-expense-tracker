import { config } from "dotenv";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(3000),
    FRONTEND_URL: z.url().default("http://localhost:5173"),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    SEED_ADMIN_EMAIL: z.email().optional(),
    SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
    WEBHOOK_SECRET: z.string().optional(),
    DISABLE_AI: z
      .enum(["true", "false", "1", "0"])
      .transform((v) => v === "true" || v === "1")
      .default(false),
    SENTRY_DSN: z.url().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
