/**
 * Seed script — creates the admin user and the AI system user if they don't
 * already exist.
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
import { AI_USER_ID, AI_USER_EMAIL, AI_USER_NAME } from "../src/lib/ai-user.js";

const prisma = getPrisma();

async function seedAiUser() {
  const existing = await prisma.user.findUnique({ where: { id: AI_USER_ID } });
  if (existing) {
    console.log(`AI system user already exists: ${AI_USER_EMAIL}`);
    return;
  }

  const now = new Date();
  await prisma.user.create({
    data: {
      id: AI_USER_ID,
      email: AI_USER_EMAIL,
      name: AI_USER_NAME,
      emailVerified: false,
      role: Role.user,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log(`✅ AI system user created: ${AI_USER_EMAIL}`);
}

async function seedAdminUser() {
  const email = env.SEED_ADMIN_EMAIL;
  const password = env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "⚠️  SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD not set — skipping admin user."
    );
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
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
      password: await hashPassword(password),
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log(`✅ Admin user created: ${email}`);
}

async function main() {
  await seedAdminUser();
  await seedAiUser();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
