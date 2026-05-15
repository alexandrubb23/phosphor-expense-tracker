import { z } from "zod";
import { OperationType } from "../constants/operation-type.js";
import { Category } from "../constants/category.js";
import { Confidence } from "../constants/confidence.js";

export const EmailTransactionSchema = z.object({
  description: z.string().trim().min(1),
  amount: z.number().positive(),
  operationType: z.enum(OperationType),
  category: z.enum(Category),
  subcategory: z.string().trim().nullable(),
  date: z.string().trim().nullable(),
  confidence: z.enum(Confidence),
});

export type EmailTransaction = z.infer<typeof EmailTransactionSchema>;
