import type PgBoss from "pg-boss";
import { getPrisma } from "../lib/prisma.js";
import { extractTransaction } from "../lib/extractTransaction.js";
import {
  TransactionStatus,
  Confidence,
  Currency,
  OperationType,
  Category,
} from "@expense-tracker/core";

export const CLASSIFY_TRANSACTION_JOB = "classify-transaction";

export interface ClassifyTransactionPayload {
  userId: string;
  effectiveSubject: string;
  effectiveBody: string;
}

export async function classifyTransactionWorker(
  jobs: PgBoss.Job<ClassifyTransactionPayload>[]
): Promise<void> {
  const prisma = getPrisma();

  for (const job of jobs) {
    const { userId, effectiveSubject, effectiveBody } = job.data;

    let extraction;
    try {
      extraction = await extractTransaction(effectiveSubject, effectiveBody);
    } catch (err) {
      console.error(
        `[classify-transaction] job ${job.id} — AI extraction failed, saving fallback transaction`,
        err
      );

      await prisma.transaction.create({
        data: {
          userId,
          description: "[AI extraction failed] — please review",
          amount: 0,
          operationType: OperationType.Outflow,
          category: Category.Other,
          subcategory: null,
          currency: Currency.RON,
          status: TransactionStatus.Pending,
          date: new Date(),
          rawEmailBody: effectiveBody,
        },
      });

      continue;
    }

    const status =
      extraction.confidence === Confidence.High
        ? TransactionStatus.Confirmed
        : TransactionStatus.Pending;

    const date = extraction.date ? new Date(extraction.date) : new Date();

    await prisma.transaction.create({
      data: {
        userId,
        description: extraction.description,
        amount: extraction.amount,
        operationType: extraction.operationType,
        category: extraction.category,
        subcategory: extraction.subcategory ?? null,
        currency: Currency.RON,
        status,
        date,
        rawEmailBody: effectiveBody,
      },
    });

    console.log(
      `[classify-transaction] job ${job.id} done — ${extraction.description} ${extraction.amount} RON`
    );
  }
}
