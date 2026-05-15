import { z } from "zod";

export const CreateWhitelistEntrySchema = z.object({
  senderEmail: z.email(),
});

export type CreateWhitelistEntry = z.infer<typeof CreateWhitelistEntrySchema>;
