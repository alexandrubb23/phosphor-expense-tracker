import { Router } from "express";
import { randomUUID } from "crypto";
import { hashPassword } from "better-auth/crypto";
import { createUserSchema, editUserSchema, Role } from "@expense-tracker/core";
import { getPrisma } from "../../lib/prisma.js";
import { validate } from "../../lib/validate.js";
import {
  HttpConflictError,
  HttpForbiddenError,
  HttpNotFoundError,
} from "../../lib/http-errors.js";

const router = Router();
const prisma = getPrisma();

router.get("/", async (_req, res) => {
  const users = await (prisma.user as any).findMany({
    where: { deletedAt: null },
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

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = validate(editUserSchema, req.body);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpNotFoundError("User not found");
  }

  if (email !== existing.email) {
    const conflict = await prisma.user.findUnique({ where: { email } });
    if (conflict) {
      throw new HttpConflictError("A user with this email already exists");
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: { name, email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (password) {
    const hashedPassword = await hashPassword(password);
    const account = await prisma.account.findFirst({
      where: { providerId: "credential", accountId: id },
    });

    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: { password: hashedPassword },
      });
    } else {
      await prisma.account.create({
        data: {
          id: randomUUID(),
          accountId: id,
          providerId: "credential",
          userId: id,
          password: hashedPassword,
        },
      });
    }
  }

  res.json({ user });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.user.findUnique({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new HttpNotFoundError("User not found");
  }

  if (existing.role === Role.admin) {
    throw new HttpForbiddenError("Admin users cannot be deleted");
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await prisma.session.deleteMany({ where: { userId: id } });

  res.status(204).send();
});

export default router;
