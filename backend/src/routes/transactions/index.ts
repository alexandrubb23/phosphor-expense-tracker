import { Router } from "express";
import { getPrisma } from "../../lib/prisma.js";
import { validate } from "../../lib/validate.js";
import {
  UpdatePendingTransactionSchema,
  TransactionSortSchema,
  TransactionFilterSchema,
  TransactionStatus,
} from "@expense-tracker/core";
import {
  HttpNotFoundError,
  HttpBadRequestError,
} from "../../lib/http-errors.js";

const router = Router();
const prisma = getPrisma();

async function requirePendingTransaction(id: string, userId: string) {
  const tx = await prisma.transaction.findUnique({ where: { id } });

  if (!tx || tx.userId !== userId || tx.deletedAt !== null) {
    throw new HttpNotFoundError("Pending transaction not found");
  }

  if (tx.status !== TransactionStatus.Pending) {
    throw new HttpBadRequestError("Transaction is not pending");
  }

  return tx;
}

router.get("/", async (req, res) => {
  const { sortBy, sortDir } = validate(TransactionSortSchema, req.query);
  const { operationType, category, status, search } = validate(
    TransactionFilterSchema,
    req.query
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.user!.id,
      deletedAt: null,
      ...(operationType ? { operationType } : {}),
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? { description: { contains: search, mode: "insensitive" } }
        : {}),
    },
    orderBy: [{ [sortBy]: sortDir }, { createdAt: sortDir }],
  });

  res.json(transactions);
});

router.patch("/:id", async (req, res) => {
  await requirePendingTransaction(req.params.id, req.user!.id);

  const updates = validate(UpdatePendingTransactionSchema, req.body);
  const updated = await prisma.transaction.update({
    where: { id: req.params.id },
    data: {
      ...updates,
      ...(updates.date ? { date: new Date(updates.date) } : {}),
    },
  });

  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await requirePendingTransaction(req.params.id, req.user!.id);

  await prisma.transaction.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  res.status(204).send();
});

export default router;
