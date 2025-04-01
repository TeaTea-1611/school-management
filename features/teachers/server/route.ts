import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { teacherSchema } from "../schema";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { teachers } from "@/db/schema";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const data = await db
        .select()
        .from(teachers)
        .orderBy(desc(teachers.firstName));

      return c.json({
        success: true,
        teachers: data,
      });
    } catch (error) {
      console.error("Error fetching teachers:", error);
      throw new HTTPException(500, { message: "Error fetching teachers" });
    }
  })

  .get("/:id", async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        return c.json(
          {
            success: false,
            message: "Invalid ID format",
          },
          400
        );
      }

      const data = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, id))
        .limit(1);

      if (data.length === 0) {
        return c.json(
          {
            success: false,
            message: "Teacher not found",
          },
          404
        );
      }

      return c.json({
        success: true,
        teacher: data[0],
      });
    } catch (error) {
      console.error("Error fetching teachers:", error);
      throw new HTTPException(500, { message: "Error fetching teachers" });
    }
  })

  .post("/create", zValidator("json", teacherSchema), async (c) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        address,
        gender,
        qualification,
      } = c.req.valid("json");

      const existingData = await db
        .select()
        .from(teachers)
        .where(eq(teachers.email, email))
        .limit(1);

      if (existingData.length > 0) {
        return c.json(
          {
            success: false,
            message: "Email already exists!",
          },
          409
        );
      }

      const newData = await db
        .insert(teachers)
        .values({
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth,
          address,
          gender,
          qualification,
        })
        .returning();

      return c.json(
        {
          success: true,
          message: "Teacher created successfully!",
          teacher: newData[0],
        },
        201
      );
    } catch (error) {
      console.error("Error creating teachers:", error);
      throw new HTTPException(500, { message: "Error creating teachers" });
    }
  })

  .patch("/:id", zValidator("json", teacherSchema), async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid ID format" }, 400);
      }

      const {
        firstName,
        lastName,
        email,
        address,
        dateOfBirth,
        phone,
        gender,
        qualification,
      } = c.req.valid("json");

      const existingSchoolYear = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "Teacher not found",
          },
          404
        );
      }

      if (email) {
        const duplicateName = await db
          .select()
          .from(teachers)
          .where(eq(teachers.email, email))
          .limit(1);

        if (duplicateName.length > 0 && duplicateName[0].id !== id) {
          return c.json(
            {
              success: false,
              message: "Email already exists!",
            },
            409
          );
        }
      }

      const updatedData = await db
        .update(teachers)
        .set({
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth,
          address,
          gender,
          qualification,
        })
        .where(eq(teachers.id, id))
        .returning();

      return c.json({
        success: true,
        message: "Teacher updated successfully!",
        teacher: updatedData[0],
      });
    } catch (error) {
      console.error("Error updating teachers:", error);
      throw new HTTPException(500, { message: "Error updating teachers" });
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
        .from(teachers)
        .where(eq(teachers.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "Teacher not found",
          },
          404
        );
      }

      await db.delete(teachers).where(eq(teachers.id, id));

      return c.json({
        success: true,
        message: "Teacher deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting teachers:", error);
      throw new HTTPException(500, { message: "Error deleting teachers" });
    }
  });

export default app;
