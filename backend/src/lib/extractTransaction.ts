import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  EmailTransactionSchema,
  type EmailTransaction,
  OperationType,
  Category,
  Confidence,
} from "@expense-tracker/core";
import { env } from "../env.js";

const SYSTEM_PROMPT = `You are a financial transaction extractor. Given an email subject and body, extract the transaction details as structured data.

Rules:
- description: a concise, human-readable description of the transaction (e.g. "Mega Image — food and drink")
- amount: a positive number (never negative)
- operationType: "${OperationType.Inflow}" for income/deposits, "${OperationType.Outflow}" for expenses/payments
- category: one of ${Object.values(Category).join(", ")}
- subcategory: optional, only if clearly stated
- date: ISO date string (YYYY-MM-DD) if mentioned, otherwise omit
- confidence: set to "high" if ALL required fields (description, amount, operationType, category) are clearly and unambiguously present; set to "low" if any required field is uncertain, missing, or ambiguous`;

const STUB: EmailTransaction = {
  description: "[AI disabled] stub transaction",
  amount: 0,
  operationType: OperationType.Outflow,
  category: Category.Other,
  subcategory: null,
  date: null,
  confidence: Confidence.Low,
};

export async function extractTransaction(
  subject: string,
  body: string
): Promise<EmailTransaction> {
  if (env.DISABLE_AI) {
    console.log("[extractTransaction] AI disabled — returning stub");
    return STUB;
  }

  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY! });

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: EmailTransactionSchema,
    system: SYSTEM_PROMPT,
    prompt: `Subject: ${subject}\n\nBody:\n${body}`,
  });

  return object;
}
