import { execSync } from "child_process";
import { readFileSync } from "fs";
import path from "path";

const backendDir = path.resolve(process.cwd(), "backend");
// Bun can require() ESM modules (unlike Node.js v20). Running Prisma CLI via
// `bun <script>` avoids the ERR_REQUIRE_ESM error in @prisma/dev.
const bunBin = execSync("which bun", { encoding: "utf-8" }).trim();
const prismaBin = path.resolve(process.cwd(), "node_modules/.bin/prisma");

function parseDotenv(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, "utf-8");
  const vars: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

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
  ] as const;
  for (const key of credentialKeys) {
    if (testEnv[key]) process.env[key] = testEnv[key];
  }

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
