import { Router } from "express";
import { getPrisma } from "../lib/prisma.js";
import { validate } from "../lib/validate.js";
import { CreateWhitelistEntrySchema } from "@expense-tracker/core";
import { HttpNotFoundError, HttpConflictError } from "../lib/http-errors.js";

const router = Router();
const prisma = getPrisma();

router.get("/", async (req, res) => {
  const entries = await prisma.senderWhitelist.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "asc" },
  });

  res.json(entries);
});

router.post("/", async (req, res) => {
  const { senderEmail } = validate(CreateWhitelistEntrySchema, req.body);

  const existing = await prisma.senderWhitelist.findUnique({
    where: { userId_senderEmail: { userId: req.user!.id, senderEmail } },
  });

  if (existing) {
    throw new HttpConflictError("This sender address is already whitelisted");
  }

  const entry = await prisma.senderWhitelist.create({
    data: { userId: req.user!.id, senderEmail },
  });

  res.status(201).json(entry);
});

router.delete("/:id", async (req, res) => {
  const entry = await prisma.senderWhitelist.findUnique({
    where: { id: req.params.id },
  });

  if (!entry || entry.userId !== req.user!.id) {
    throw new HttpNotFoundError("Whitelist entry not found");
  }

  await prisma.senderWhitelist.delete({ where: { id: req.params.id } });

  res.status(204).send();
});

export default router;
