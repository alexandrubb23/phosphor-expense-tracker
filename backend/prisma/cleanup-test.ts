/**
 * E2E cleanup script — removes test-created data from the test database.
 * Runs after the full Playwright suite via global-teardown.
 *
 * What gets removed:
 *   - All users whose email is NOT in the seed list (and their accounts/sessions
 *     via CASCADE).
 *   - All sessions belonging to the seed users (stale auth state).
 *   - All verification records.
 *
 * Usage (called automatically by global-teardown):
 *   bun prisma/cleanup-test.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("../src/generated/prisma/client.js");
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter, log: ["error"] });

  const seedEmails = [
    process.env.SEED_ADMIN_EMAIL,
    process.env.TEST_USER_EMAIL,
  ].filter(Boolean) as string[];

  // Delete all users that were created by tests (not the seed users).
  // Account and Session rows cascade-delete automatically.
  const { count: deletedUsers } = await prisma.user.deleteMany({
    where: { email: { notIn: seedEmails } },
  });

  // Clear sessions for seed users so the next run starts unauthenticated.
  const { count: deletedSessions } = await prisma.session.deleteMany({
    where: { user: { email: { in: seedEmails } } },
  });

  // Remove any leftover verification tokens.
  const { count: deletedVerifications } = await prisma.verification.deleteMany(
    {}
  );

  console.log(`  🗑️  Deleted ${deletedUsers} test user(s)`);
  console.log(`  🗑️  Deleted ${deletedSessions} session(s)`);
  console.log(`  🗑️  Deleted ${deletedVerifications} verification record(s)`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("cleanup-test failed:", err);
  process.exit(1);
});
