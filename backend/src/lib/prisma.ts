import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// Lazy-loaded after `bunx prisma generate` produces the client.
let _prisma: any = null;

export function getPrisma() {
  if (!_prisma) {
    const { PrismaClient } = require("../generated/prisma/client.js");
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    _prisma = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    });
  }
  return _prisma;
}

export default getPrisma;
