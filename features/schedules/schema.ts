import { z } from "zod";

export const scheduleSchema = z.object({
  classId: z.coerce.number().int(),
  subjectId: z.coerce.number().int(),
  teacherId: z.coerce.number().int(),
  classroomId: z.coerce.number().int(),
  schoolYearId: z.coerce.number().int(),
  dayOfWeek: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),
  startTime: z.string().length(5),
  endTime: z.string().length(5),
  isActive: z.boolean(),
});
