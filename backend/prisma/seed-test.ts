/**
 * E2E seed script — creates test users in the test database if they don't exist.
 * Reads credentials from process.env (injected by e2e/global-setup.ts).
 *
 * Users created:
 *   - Admin user  (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD)
 *   - Regular user (TEST_USER_EMAIL / TEST_USER_PASSWORD)
 *
 * Usage (called automatically by global-setup):
 *   bun prisma/seed-test.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

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

    console.log(`  ✅ Created ${role} user: ${email}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("seed-test failed:", err);
  process.exit(1);
});
