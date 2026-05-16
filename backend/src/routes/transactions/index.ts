import { Router } from "express";
import { getPrisma } from "../../lib/prisma.js";
import { validate } from "../../lib/validate.js";
import {
  CreateTransactionSchema,
  UpdateTransactionSchema,
  TransactionSortSchema,
  TransactionFilterSchema,
  TransactionPaginationSchema,
  TransactionSummaryQuerySchema,
  SummaryPeriod,
  type SummaryPeriod as SummaryPeriodType,
} from "@expense-tracker/core";
import { HttpNotFoundError } from "../../lib/http-errors.js";
import { AI_USER_ID } from "../../lib/ai-user.js";

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

router.get("/summary", async (req, res) => {
  const { period, from, to } = validate(
    TransactionSummaryQuerySchema,
    req.query
  );

  const dateRange = getDateRange(period, from, to);
  const dateGte = dateRange.gte ?? new Date(0);
  const dateLte = dateRange.lte ?? new Date("9999-12-31");

  type CategorySum = { category: string; total: string };

  type SummaryRow = {
    total_inflow: string;
    total_outflow: string;
    by_category: Array<CategorySum>;
    total_count: bigint;
    inflow_count: bigint;
    outflow_count: bigint;
    ai_resolved_count: bigint;
    avg_resolution_ms: number | null;
  };

  const [row] = await prisma.$queryRaw<SummaryRow[]>`
    SELECT * FROM get_transaction_summary(
      ${req.user!.id},
      ${dateGte}::timestamptz,
      ${dateLte}::timestamptz,
      ${AI_USER_ID}
    )
  `;

  const totalCount = Number(row.total_count);
  const aiResolvedCount = Number(row.ai_resolved_count);

  res.json({
    totalInflow: Number(row.total_inflow),
    totalOutflow: Number(row.total_outflow),
    byCategory: (row.by_category ?? []).map((r: CategorySum) => ({
      category: r.category,
      total: Number(r.total),
    })),
    totalCount,
    inflowCount: Number(row.inflow_count),
    outflowCount: Number(row.outflow_count),
    aiResolvedCount,
    aiResolvedPercent:
      totalCount > 0 ? Math.round((aiResolvedCount / totalCount) * 100) : 0,
    avgResolutionMs: Number(row.avg_resolution_ms ?? 0),
  });
});

router.post("/", async (req, res) => {
  const data = validate(CreateTransactionSchema, req.body);

  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      date: new Date(data.date),
      userId: req.user!.id,
    },
  });

  res.status(201).json(transaction);
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
  await requireOwnedTransaction(req.params.id, req.user!.id);

  const updates = validate(UpdateTransactionSchema, req.body);
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
