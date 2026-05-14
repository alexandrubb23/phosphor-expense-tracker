import { execSync } from "child_process";
import path from "path";
import { parseDotenv } from "./helpers/env";

const backendDir = path.resolve(process.cwd(), "backend");
const bunBin = execSync("which bun", { encoding: "utf-8" }).trim();

export default async function globalTeardown() {
  const testEnv = parseDotenv(path.join(backendDir, ".env.test"));
  const databaseUrl = testEnv.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL not found in backend/.env.test");
  }

  const cleanupEnv = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    NODE_ENV: "test",
    SEED_ADMIN_EMAIL: testEnv.SEED_ADMIN_EMAIL ?? "",
    TEST_USER_EMAIL: testEnv.TEST_USER_EMAIL ?? "",
  };

  console.log("\n🧹 Cleaning up test database...");
  execSync(`${bunBin} prisma/cleanup-test.ts`, {
    cwd: backendDir,
    stdio: "inherit",
    env: cleanupEnv,
  });

  console.log("✅ Test database cleaned.\n");
}
