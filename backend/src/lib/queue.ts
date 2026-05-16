import PgBoss from "pg-boss";
import { env } from "../env.js";
import {
  CLASSIFY_TRANSACTION_JOB,
  classifyTransactionWorker,
  type ClassifyTransactionPayload,
} from "../jobs/classifyTransaction.js";

let _queue: PgBoss | null = null;

export function getQueue(): PgBoss {
  if (!_queue) {
    _queue = new PgBoss({
      connectionString: env.DATABASE_URL,
      deleteAfterDays: 1,
      retryLimit: 3,
      retryDelay: 30,
    });
  }
  return _queue;
}

export async function startQueue(): Promise<void> {
  const queue = getQueue();

  queue.on("error", (err) => console.error("[pg-boss] error", err));

  await queue.start();

  await queue.createQueue(CLASSIFY_TRANSACTION_JOB);

  await queue.work<ClassifyTransactionPayload>(
    CLASSIFY_TRANSACTION_JOB,
    { batchSize: 5 },
    classifyTransactionWorker
  );

  console.log("[pg-boss] worker registered for:", CLASSIFY_TRANSACTION_JOB);
}
