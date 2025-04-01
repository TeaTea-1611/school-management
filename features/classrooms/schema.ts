import { z } from "zod";

export const classroomSchema = z.object({
  name: z.string().min(1).max(50),
  capacity: z.coerce.number().int(),
  location: z.string().min(1).max(100),
  floor: z.coerce.number().int(),
  hasProjector: z.boolean(),
});
