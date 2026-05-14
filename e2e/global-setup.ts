import { execSync } from "child_process";
import { readFileSync } from "fs";
import path from "path";

const backendDir = path.resolve(process.cwd(), "backend");

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

  console.log("\n🗄️  Running Prisma migrations on test database...");
  execSync("bunx prisma migrate deploy", {
    cwd: backendDir,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
  console.log("✅ Test database ready.\n");
}
