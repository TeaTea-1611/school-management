import { db } from "@/db";
import { students } from "@/db/schema";
import { zValidator } from "@hono/zod-validator";
import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { studentSchema } from "../schema";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const data = await db
        .select()
        .from(students)
        .orderBy(asc(students.firstName));

      return c.json({
        success: true,
        students: data,
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      throw new HTTPException(500, { message: "Error fetching students" });
    }
  })

  .get("/:id", async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        throw new HTTPException(400, { message: "Invalid ID format" });
      }

      const data = await db
        .select()
        .from(students)
        .where(eq(students.id, id))
        .limit(1);

      if (data.length === 0) {
        throw new HTTPException(404, {
          message: "Student not found",
        });
      }

      return c.json({
        success: true,
        data: data[0],
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      throw new HTTPException(500, { message: "Error fetching students" });
    }
  })

  .post("/create", zValidator("json", studentSchema), async (c) => {
    try {
      const {
        firstName,
        lastName,
        gender,
        dateOfBirth,
        schoolYearId,
        address,
        classId,
        parentId,
      } = c.req.valid("json");

      const newData = await db
        .insert(students)
        .values({
          firstName,
          lastName,
          gender,
          dateOfBirth,
          schoolYearId,
          address,
          classId,
          parentId,
        })
        .returning();

      return c.json(
        {
          success: true,
          message: "Student created successfully!",
          data: newData[0],
        },
        201
      );
    } catch (error) {
      console.error("Error creating students:", error);
      throw new HTTPException(500, { message: "Error creating students" });
    }
  })

  .patch("/:id", zValidator("json", studentSchema), async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid ID format" }, 400);
      }

      const {
        firstName,
        lastName,
        gender,
        dateOfBirth,
        schoolYearId,
        address,
        classId,
        parentId,
      } = c.req.valid("json");

      const updatedData = await db
        .update(students)
        .set({
          firstName,
          lastName,
          gender,
          dateOfBirth,
          schoolYearId,
          address,
          classId,
          parentId,
        })
        .where(eq(students.id, id))
        .returning();

      return c.json({
        success: true,
        message: "Student updated successfully!",
        data: updatedData[0],
      });
    } catch (error) {
      console.error("Error updating students:", error);
      throw new HTTPException(500, { message: "Error updating students" });
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
        .from(students)
        .where(eq(students.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "Student not found",
          },
          404
        );
      }

      await db.delete(students).where(eq(students.id, id));

      return c.json({
        success: true,
        message: "Student deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting students:", error);
      throw new HTTPException(500, { message: "Error deleting students" });
    }
  });

export default app;
