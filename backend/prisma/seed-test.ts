/**
 * E2E seed script — creates test users in the test database if they don't exist.
 * Reads credentials from process.env (injected by e2e/global-setup.ts).
 *
 * Users created:
 *   - Admin user  (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD)
 *   - Regular user (TEST_USER_EMAIL / TEST_USER_PASSWORD)
 *   - AI system user (fixed well-known ID, no password)
 *
 * Usage (called automatically by global-setup):
 *   bun prisma/seed-test.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { AI_USER_ID, AI_USER_EMAIL, AI_USER_NAME } from "../src/lib/ai-user.js";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("../src/generated/prisma/client.js");
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter, log: ["error"] });

  const users = [
    {
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      name: "Admin",
      role: "admin" as const,
    },
    {
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
      name: "Test User",
      role: "user" as const,
    },
  ];

  for (const { email, password, name, role } of users) {
    if (!email || !password) {
      console.warn(`⚠️  Skipping ${role} user — email or password not set.`);
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`  User already exists: ${email}`);
      continue;
    }

    const id = crypto.randomUUID();
    const now = new Date();

    await prisma.user.create({
      data: {
        id,
        email,
        name,
        emailVerified: true,
        role,
        createdAt: now,
        updatedAt: now,
      },
    });

    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: id,
        providerId: "credential",
        userId: id,
        password: await hashPassword(password),
        createdAt: now,
        updatedAt: now,
      },
    });

    await prisma.senderWhitelist.create({
      data: { userId: id, senderEmail: email },
    });

    console.log(`  ✅ Created ${role} user: ${email}`);
  }

  // AI system user (no password, fixed well-known ID)
  const existingAi = await prisma.user.findUnique({
    where: { id: AI_USER_ID },
  });
  if (!existingAi) {
    const now = new Date();
    await prisma.user.create({
      data: {
        id: AI_USER_ID,
        email: AI_USER_EMAIL,
        name: AI_USER_NAME,
        emailVerified: false,
        role: "user",
        createdAt: now,
        updatedAt: now,
      },
    });
    console.log(`  ✅ Created AI system user: ${AI_USER_EMAIL}`);
  } else {
    console.log(`  AI system user already exists: ${AI_USER_EMAIL}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("seed-test failed:", err);
  process.exit(1);
});
