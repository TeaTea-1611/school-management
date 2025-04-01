import { z } from "zod";

export const teacherSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string(),
  phone: z.string().min(10).max(20),
  email: z.string().email(),
  address: z.string(),
  gender: z.enum(["male", "female"]),
  qualification: z.string(),
});
