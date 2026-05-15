import { Router } from "express";
import { getPrisma } from "../../lib/prisma.js";
import { validate } from "../../lib/validate.js";
import {
  UpdatePendingTransactionSchema,
  TransactionSortSchema,
  TransactionFilterSchema,
  TransactionPaginationSchema,
  TransactionSummaryQuerySchema,
  TransactionStatus,
  OperationType,
  SummaryPeriod,
  type SummaryPeriod as SummaryPeriodType,
} from "@expense-tracker/core";
import {
  HttpNotFoundError,
  HttpBadRequestError,
} from "../../lib/http-errors.js";

const router = Router();
const prisma = getPrisma();

function getDateRange(period: SummaryPeriodType, from?: string, to?: string) {
  if (period === SummaryPeriod.custom) {
    return {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
    };
  }

  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  if (period === SummaryPeriod.week) {
    const day = start.getUTCDay();
    start.setUTCDate(start.getUTCDate() - (day === 0 ? 6 : day - 1));
  } else if (period === SummaryPeriod.month) {
    start.setUTCDate(1);
  } else if (period === SummaryPeriod.year) {
    start.setUTCMonth(0, 1);
  }
  // SummaryPeriod.today — start is already start of today UTC

  return { gte: start };
}

async function requireOwnedTransaction(id: string, userId: string) {
  const tx = await prisma.transaction.findUnique({ where: { id } });

  if (!tx || tx.userId !== userId || tx.deletedAt !== null) {
    throw new HttpNotFoundError("Transaction not found");
  }

  return tx;
}

async function requirePendingTransaction(id: string, userId: string) {
  const tx = await requireOwnedTransaction(id, userId);

  if (tx.status !== TransactionStatus.Pending) {
    throw new HttpBadRequestError("Transaction is not pending");
  }

  return tx;
}

router.get("/summary", async (req, res) => {
  const { period, from, to } = validate(
    TransactionSummaryQuerySchema,
    req.query
  );

  const dateRange = getDateRange(period, from, to);
  const baseWhere = {
    userId: req.user!.id,
    deletedAt: null,
    date: dateRange,
  };

  const [inflowResult, outflowResult, byCategoryResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...baseWhere, operationType: OperationType.Inflow },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { ...baseWhere, operationType: OperationType.Outflow },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: { ...baseWhere, operationType: OperationType.Outflow },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
  ]);

  res.json({
    totalInflow: Number(inflowResult._sum.amount ?? 0),
    totalOutflow: Number(outflowResult._sum.amount ?? 0),
    byCategory: byCategoryResult.map(
      (r: { category: string; _sum: { amount: number | null } }) => ({
        category: r.category,
        total: Number(r._sum.amount ?? 0),
      })
    ),
  });
});

router.get("/", async (req, res) => {
  const { sortBy, sortDir } = validate(TransactionSortSchema, req.query);
  const { operationType, category, status, search } = validate(
    TransactionFilterSchema,
    req.query
  );
  const { page, pageSize } = validate(TransactionPaginationSchema, req.query);

  const where = {
    userId: req.user!.id,
    deletedAt: null,
    ...(operationType ? { operationType } : {}),
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? { description: { contains: search, mode: "insensitive" } }
      : {}),
  };

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: [{ [sortBy]: sortDir }, { createdAt: sortDir }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  res.json({
    data: transactions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
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
  await requireOwnedTransaction(req.params.id, req.user!.id);

  await prisma.transaction.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  res.status(204).send();
});

export default router;
