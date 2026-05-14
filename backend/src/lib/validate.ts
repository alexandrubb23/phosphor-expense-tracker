import { z, type ZodType } from "zod";
import { HttpBadRequestError } from "./http-errors.js";

export const validate = <T>(schema: ZodType<T>, data: unknown): T => {
  const parsed = schema.safeParse(data);
  if (!parsed.success)
    throw new HttpBadRequestError(z.treeifyError(parsed.error));
  return parsed.data;
};
