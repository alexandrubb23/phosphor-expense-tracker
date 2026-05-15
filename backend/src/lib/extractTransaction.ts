import { generateText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  EmailTransactionSchema,
  type EmailTransaction,
  OperationType,
  Category,
  Confidence,
} from "@expense-tracker/core";
import { env } from "../env.js";

const SYSTEM_PROMPT = `Extract financial transaction details from the email.
- description: concise "merchant — item/type" format (e.g. "Mega Image — food and drink"); never echo the raw input verbatim
- operationType: "${OperationType.Inflow}" = income/deposit, "${OperationType.Outflow}" = expense/payment
- date: YYYY-MM-DD if present, otherwise omit
- confidence: "${Confidence.High}" only when description, amount, operationType, and category are all unambiguous; otherwise "${Confidence.Low}"`;

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

  const { toolCalls } = await generateText({
    model: openai("gpt-5-nano"),
    system: SYSTEM_PROMPT,
    prompt: `Subject: ${subject}\n\nBody:\n${body}`,
    tools: {
      extractTransaction: tool({
        description: "Extract transaction details from the email",
        inputSchema: EmailTransactionSchema,
      }),
    },
    toolChoice: { type: "tool", toolName: "extractTransaction" },
  });

  return EmailTransactionSchema.parse(toolCalls[0].input);
}
