import { Router } from "express";
import multer from "multer";
import { getPrisma } from "../../lib/prisma.js";
import { extractTransaction } from "../../lib/extractTransaction.js";
import { TransactionStatus, Confidence, Currency } from "@expense-tracker/core";

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

  // Silent reject — return 200 to prevent SendGrid from retrying
  if (!whitelistEntry) {
    res.status(200).json({ ok: true });
    return;
  }

  // Respond immediately so SendGrid doesn't time out or retry.
  // Extraction + DB write happen asynchronously in the background.
  res.status(200).json({ ok: true });

  const { userId } = whitelistEntry;

  (async () => {
    try {
      const extraction = await extractTransaction(
        effectiveSubject,
        effectiveBody
      );

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
    } catch (err) {
      console.error("[webhook/email] async processing failed", err);
    }
  })();
});

export default router;
