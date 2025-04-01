import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { subjectSchema } from "../schema";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { subjects } from "@/db/schema";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const data = await db
        .select()
        .from(subjects)
        .orderBy(desc(subjects.name));

      return c.json({
        success: true,
        subjects: data,
      });
    } catch (error) {
      console.error("Error fetching subjects:", error);
      throw new HTTPException(500, { message: "Error fetching subjects" });
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
        .from(subjects)
        .where(eq(subjects.id, id))
        .limit(1);

      if (data.length === 0) {
        return c.json(
          {
            success: false,
            message: "Subjects not found",
          },
          404
        );
      }

      return c.json({
        success: true,
        subject: data[0],
      });
    } catch (error) {
      console.error("Error fetching subjects:", error);
      throw new HTTPException(500, { message: "Error fetching subjects" });
    }
  })

  .post("/create", zValidator("json", subjectSchema), async (c) => {
    try {
      const { name } = c.req.valid("json");

      const existingData = await db
        .select()
        .from(subjects)
        .where(eq(subjects.name, name))
        .limit(1);

      if (existingData.length > 0) {
        return c.json(
          {
            success: false,
            message: "Subjects already exists!",
          },
          409
        );
      }

      console.log("creating");

      const newData = await db.insert(subjects).values({ name }).returning();

      return c.json(
        {
          success: true,
          message: "Subjects created successfully!",
          subject: newData[0],
        },
        201
      );
    } catch (error) {
      console.error("Error creating subjects:", error);
      throw new HTTPException(500, { message: "Error creating subjects" });
    }
  })

  .patch("/:id", zValidator("json", subjectSchema), async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid ID format" }, 400);
      }

      const { name } = c.req.valid("json");

      const existingSchoolYear = await db
        .select()
        .from(subjects)
        .where(eq(subjects.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "Subjects not found",
          },
          404
        );
      }

      // Kiểm tra tên mới có trùng với tên năm học khác không
      if (name) {
        const duplicateName = await db
          .select()
          .from(subjects)
          .where(eq(subjects.name, name))
          .limit(1);

        if (duplicateName.length > 0 && duplicateName[0].id !== id) {
          return c.json(
            {
              success: false,
              message: "Subjects with this name already exists!",
            },
            409
          );
        }
      }

      const updatedData = await db
        .update(subjects)
        .set({
          name,
        })
        .where(eq(subjects.id, id))
        .returning();

      return c.json({
        success: true,
        message: "Subjects updated successfully!",
        subject: updatedData[0],
      });
    } catch (error) {
      console.error("Error updating subjects:", error);
      throw new HTTPException(500, { message: "Error updating subjects" });
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
        .from(subjects)
        .where(eq(subjects.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "Subjects not found",
          },
          404
        );
      }

      await db.delete(subjects).where(eq(subjects.id, id));

      return c.json({
        success: true,
        message: "Subjects deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting subjects:", error);
      throw new HTTPException(500, { message: "Error deleting subjects" });
    }
  });

export default app;
