import { db } from "@/db";
import { schedules } from "@/db/schema";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { scheduleSchema } from "../schema";

const app = new Hono()
  .post("/create", zValidator("json", scheduleSchema), async (c) => {
    try {
      const {
        classId,
        classroomId,
        dayOfWeek,
        endTime,
        isActive,
        schoolYearId,
        startTime,
        subjectId,
        teacherId,
      } = c.req.valid("json");

      const newData = await db
        .insert(schedules)
        .values({
          classId,
          classroomId,
          dayOfWeek,
          endTime,
          isActive,
          schoolYearId,
          startTime,
          subjectId,
          teacherId,
        })
        .returning();

      return c.json(
        {
          success: true,
          message: "Schedules created successfully!",
          data: newData[0],
        },
        201
      );
    } catch (error) {
      console.error("Error creating schedules:", error);
      throw new HTTPException(500, { message: "Error creating schedules" });
    }
  })

  .patch("/:id", zValidator("json", scheduleSchema), async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid ID format" }, 400);
      }

      const {
        classId,
        classroomId,
        dayOfWeek,
        endTime,
        isActive,
        schoolYearId,
        startTime,
        subjectId,
        teacherId,
      } = c.req.valid("json");

      const updatedData = await db
        .update(schedules)
        .set({
          classId,
          classroomId,
          dayOfWeek,
          endTime,
          isActive,
          schoolYearId,
          startTime,
          subjectId,
          teacherId,
        })
        .where(eq(schedules.id, id))
        .returning();

      return c.json({
        success: true,
        message: "Schedules updated successfully!",
        data: updatedData[0],
      });
    } catch (error) {
      console.error("Error updating schedules:", error);
      throw new HTTPException(500, { message: "Error updating schedules" });
    }
  })

  .delete("/:id", async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid ID format" }, 400);
      }

      const existingSchoolYear = await db
        .select()
        .from(schedules)
        .where(eq(schedules.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "Schedules not found",
          },
          404
        );
      }

      await db.delete(schedules).where(eq(schedules.id, id));

      return c.json({
        success: true,
        message: "Schedules deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting schedules:", error);
      throw new HTTPException(500, { message: "Error deleting schedules" });
    }
  });

export default app;
