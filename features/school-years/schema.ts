import { z } from "zod";

export const schoolYearSchema = z.object({
  name: z.string().min(4).max(50),
});
