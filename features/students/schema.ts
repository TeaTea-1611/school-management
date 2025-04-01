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
  address: z
    .string()
    .max(255, "Address must be 255 characters or less")
    .optional(), // text không có giới hạn cụ thể, nhưng đặt max để hợp lý
  classId: z.number().int().positive().optional(), // Tùy chọn vì có thể null
  schoolYearId: z
    .number()
    .int()
    .positive()
    .min(1, "School year ID is required"), // Bắt buộc
  parentId: z.number().int().positive().optional(), // Tùy chọn vì có thể null
});
