import { Router } from "express";
import multer from "multer";
import { getQueue } from "@/lib/queue";
import { CLASSIFY_TRANSACTION_JOB } from "@/jobs/classifyTransaction";
import { getPrisma } from "@/lib/prisma";
import { env } from "@/env";
import {
  TransactionStatus,
  Currency,
  OperationType,
  Category,
} from "@expense-tracker/core";

const router = Router();
const prisma = getPrisma();
const upload = multer({ storage: multer.memoryStorage() });

// Parse sender address from SendGrid's "from" field, e.g. "John Doe <john@example.com>"
function parseSenderEmail(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).trim().toLowerCase();
}

router.post("/", upload.none(), async (req, res) => {
  const {
    from = "",
    subject = "",
    text = "",
    html = "",
  } = req.body as Record<string, string>;

  const senderEmail = parseSenderEmail(from);
  const body = text || html;

  // Use whichever of subject/body is non-empty; fall back to the other
  const effectiveSubject = subject || body;
  const effectiveBody = body || subject;

  const whitelistEntry = await prisma.senderWhitelist.findFirst({
    where: { senderEmail },
  });

  if (!whitelistEntry) {
    // Silently accept so SendGrid doesn't retry unknown senders.
    res.status(200).json({ ok: true });
    return;
  }

  // Respond immediately so SendGrid doesn't time out or retry.
  // Extraction + DB write happen via pg-boss job queue (or directly when AI is disabled).
  res.status(200).json({ ok: true });

  const { userId } = whitelistEntry;

  if (env.DISABLE_AI) {
    // When AI is disabled (e.g. during tests), skip the job queue entirely and
    // create a pending placeholder transaction directly.
    await getPrisma().transaction.create({
      data: {
        userId,
        description: effectiveSubject || effectiveBody,
        amount: 0,
        operationType: OperationType.Outflow,
        category: Category.Other,
        subcategory: null,
        currency: Currency.RON,
        status: TransactionStatus.Pending,
        date: new Date(),
        rawEmailBody: effectiveBody,
        resolvedByUserId: null,
      },
    });
    return;
  }

  await getQueue().send(CLASSIFY_TRANSACTION_JOB, {
    userId,
    effectiveSubject,
    effectiveBody,
  });
});

export default router;
