import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1).max(50),
});
