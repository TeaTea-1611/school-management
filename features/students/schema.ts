import { z } from "zod";

export const studentSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or less"),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female"]),
  address: z.string().max(255, "Address must be 255 characters or less"),
  classId: z.coerce.number().int(),
  schoolYearId: z.coerce.number().int(),
  parentId: z.coerce.number().int().optional(),
});
