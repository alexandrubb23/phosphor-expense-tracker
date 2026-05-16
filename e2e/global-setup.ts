import { execSync } from "child_process";
import path from "path";
import { parseDotenv } from "./helpers/env";

const backendDir = path.resolve(process.cwd(), "backend");
// Bun can require() ESM modules (unlike Node.js v20). Running Prisma CLI via
// `bun <script>` avoids the ERR_REQUIRE_ESM error in @prisma/dev.
const bunBin = execSync("which bun", { encoding: "utf-8" }).trim();
const prismaBin = path.resolve(process.cwd(), "node_modules/.bin/prisma");

export default async function globalSetup() {
  const testEnv = parseDotenv(path.join(backendDir, ".env.test"));
  const databaseUrl = testEnv.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL not found in backend/.env.test");
  }

  // Expose test credentials to Playwright workers (workers inherit process.env).
  const credentialKeys = [
    "SEED_ADMIN_EMAIL",
    "SEED_ADMIN_PASSWORD",
    "TEST_USER_EMAIL",
    "TEST_USER_PASSWORD",
    "WEBHOOK_SECRET",
    "PORT",
  ] as const;
  for (const key of credentialKeys) {
    if (testEnv[key]) process.env[key] = testEnv[key];
  }
  // Expose backend port so e2e test files can build the correct base URL.
  process.env.BACKEND_PORT = testEnv.PORT ?? "3001";

  const seedEnv = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    NODE_ENV: "test",
  };

  console.log("\n🗄️  Running Prisma migrations on test database...");
  execSync(`${bunBin} ${prismaBin} migrate deploy`, {
    cwd: backendDir,
    stdio: "inherit",
    env: seedEnv,
  });

  console.log("🌱 Seeding test users...");
  execSync(`${bunBin} prisma/seed-test.ts`, {
    cwd: backendDir,
    stdio: "inherit",
    env: seedEnv,
  });

  console.log("✅ Test database ready.\n");
}
