import { Router } from "express";
import { randomUUID } from "crypto";
import { hashPassword } from "better-auth/crypto";
import { createUserSchema } from "@expense-tracker/core";
import { getPrisma } from "../../lib/prisma.js";
import { Role } from "../../generated/prisma/client.js";
import { validate } from "../../lib/validate.js";
import { HttpConflictError } from "../../lib/http-errors.js";

const router = Router();

router.get("/", async (_req, res) => {
  const prisma = getPrisma();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ users });
});

router.post("/", async (req, res) => {
  const { name, email, password } = validate(createUserSchema, req.body);

  const prisma = getPrisma();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpConflictError("A user with this email already exists");
  }

  const hashedPassword = await hashPassword(password);
  const userId = randomUUID();

  const user = await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: false,
      role: Role.user,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
    },
  });

  res.status(201).json({ user });
});

export default router;
