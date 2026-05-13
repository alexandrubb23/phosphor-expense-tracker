import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../env.js";

// Lazy-loaded after `bunx prisma generate` produces the client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _prisma: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPrisma(): any {
  if (!_prisma) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("../generated/prisma/client.js");
    const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
    _prisma = new PrismaClient({
      adapter,
      log: env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    });
  }
  return _prisma;
}

export default getPrisma;
