import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { schoolYearSchema } from "../schema";
import { db } from "@/db";
import { schoolYears } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const data = await db
        .select()
        .from(schoolYears)
        .orderBy(desc(schoolYears.name));

      return c.json({
        success: true,
        schoolYears: data,
      });
    } catch (error) {
      console.error("Error fetching school years:", error);
      throw new HTTPException(500, { message: "Error fetching school years" });
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
        .from(schoolYears)
        .where(eq(schoolYears.id, id))
        .limit(1);

      if (data.length === 0) {
        return c.json(
          {
            success: false,
            message: "School year not found",
          },
          404
        );
      }

      return c.json({
        success: true,
        schoolYear: data[0],
      });
    } catch (error) {
      console.error("Error fetching school year:", error);
      throw new HTTPException(500, { message: "Error fetching school year" });
    }
  })

  .post("/create", zValidator("json", schoolYearSchema), async (c) => {
    try {
      const { name } = c.req.valid("json");

      // Kiểm tra tên năm học đã tồn tại chưa
      const existingData = await db
        .select()
        .from(schoolYears)
        .where(eq(schoolYears.name, name))
        .limit(1);

      if (existingData.length > 0) {
        return c.json(
          {
            success: false,
            message: "School year already exists!",
          },
          409
        );
      }

      const newData = await db
        .insert(schoolYears)
        .values({
          name,
        })
        .returning();

      return c.json(
        {
          success: true,
          message: "School year created successfully!",
          schoolYear: newData[0],
        },
        201
      );
    } catch (error) {
      console.error("Error creating school year:", error);
      throw new HTTPException(500, { message: "Error creating school year" });
    }
  })

  .patch("/:id", zValidator("json", schoolYearSchema), async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid ID format" }, 400);
      }

      const { name } = c.req.valid("json");

      // Kiểm tra năm học có tồn tại không
      const existingSchoolYear = await db
        .select()
        .from(schoolYears)
        .where(eq(schoolYears.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "School year not found",
          },
          404
        );
      }

      // Kiểm tra tên mới có trùng với tên năm học khác không
      if (name) {
        const duplicateName = await db
          .select()
          .from(schoolYears)
          .where(eq(schoolYears.name, name))
          .limit(1);

        if (duplicateName.length > 0 && duplicateName[0].id !== id) {
          return c.json(
            {
              success: false,
              message: "School year with this name already exists!",
            },
            409
          );
        }
      }

      const updatedData = await db
        .update(schoolYears)
        .set({
          name,
        })
        .where(eq(schoolYears.id, id))
        .returning();

      return c.json({
        success: true,
        message: "School year updated successfully!",
        schoolYear: updatedData[0],
      });
    } catch (error) {
      console.error("Error updating school year:", error);
      throw new HTTPException(500, { message: "Error updating school year" });
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
        .from(schoolYears)
        .where(eq(schoolYears.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "School year not found",
          },
          404
        );
      }

      await db.delete(schoolYears).where(eq(schoolYears.id, id));

      return c.json({
        success: true,
        message: "School year deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting school year:", error);
      throw new HTTPException(500, { message: "Error deleting school year" });
    }
  });

export default app;
