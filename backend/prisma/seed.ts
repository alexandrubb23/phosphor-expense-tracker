/**
 * Seed script — creates the admin user if it doesn't already exist.
 *
 * Usage:
 *   bun run seed
 *
 * Credentials are read from env vars (with defaults matching .env.example):
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_PASSWORD
 */

import { env } from "../src/env.js";
import { getPrisma } from "../src/lib/prisma.js";
import { Role } from "../src/generated/prisma/client.js";
import { hashPassword } from "better-auth/crypto";

const prisma = getPrisma();

async function main() {
  const email = env.SEED_ADMIN_EMAIL;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    process.exit(0);
  }

  const id = crypto.randomUUID();
  const now = new Date();

  await prisma.user.create({
    data: {
      id,
      email,
      name: "Admin",
      emailVerified: true,
      role: Role.admin,
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
      password: await hashPassword(env.SEED_ADMIN_PASSWORD),
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log(`✅ Admin user created: ${email}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
