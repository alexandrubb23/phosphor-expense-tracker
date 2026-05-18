import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrisma } from "@/lib/prisma";
import { env } from "@/env";
import { Role } from "@expense-tracker/core";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(getPrisma(), { provider: "postgresql" }),
  trustedOrigins: [env.FRONTEND_URL],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  rateLimit: {
    enabled: env.NODE_ENV === "production",
    window: 60,
    max: 10,
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: Role.user,
        input: false,
        required: true,
      },
      deletedAt: {
        type: "date",
        input: false,
        required: false,
      },
    },
  },
});
