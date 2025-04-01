import { z } from "zod";

export const classSchema = z.object({
  name: z.string().min(1).max(50),
  supervisorId: z.coerce.number().int(),
  schoolYearId: z.coerce.number().int(),
  capacity: z.coerce.number().int(),
});
