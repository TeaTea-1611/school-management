import { db } from "@/db";
import { classrooms } from "@/db/schema";
import { zValidator } from "@hono/zod-validator";
import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { classroomSchema } from "../schema";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const data = await db
        .select()
        .from(classrooms)
        .orderBy(asc(classrooms.name));

      return c.json({
        success: true,
        classrooms: data,
      });
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      throw new HTTPException(500, { message: "Error fetching classrooms" });
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
        .from(classrooms)
        .where(eq(classrooms.id, id))
        .limit(1);

      if (data.length === 0) {
        return c.json(
          {
            success: false,
            message: "Classroom not found",
          },
          404
        );
      }

      return c.json({
        success: true,
        data: data[0],
      });
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      throw new HTTPException(500, { message: "Error fetching classrooms" });
    }
  })

  .post("/create", zValidator("json", classroomSchema), async (c) => {
    try {
      const { name, capacity, floor, hasProjector, location } =
        c.req.valid("json");

      const existingData = await db
        .select()
        .from(classrooms)
        .where(eq(classrooms.name, name))
        .limit(1);

      if (existingData.length > 0) {
        return c.json(
          {
            success: false,
            message: "Classroom already exists!",
          },
          409
        );
      }

      const newData = await db
        .insert(classrooms)
        .values({
          name,
          floor,
          hasProjector,
          location,
          capacity,
        })
        .returning();

      return c.json(
        {
          success: true,
          message: "Classroom created successfully!",
          data: newData[0],
        },
        201
      );
    } catch (error) {
      console.error("Error creating classrooms:", error);
      throw new HTTPException(500, { message: "Error creating classrooms" });
    }
  })

  .patch("/:id", zValidator("json", classroomSchema), async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid ID format" }, 400);
      }

      const { name, floor, hasProjector, location, capacity } =
        c.req.valid("json");

      const existingSchoolYear = await db
        .select()
        .from(classrooms)
        .where(eq(classrooms.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "Classroom not found",
          },
          404
        );
      }

      const duplicateName = await db
        .select()
        .from(classrooms)
        .where(eq(classrooms.name, name))
        .limit(1);

      if (duplicateName.length > 0 && duplicateName[0].id !== id) {
        return c.json(
          {
            success: false,
            message: "Classroom already exists!",
          },
          409
        );
      }

      const updatedData = await db
        .update(classrooms)
        .set({
          name,
          floor,
          hasProjector,
          location,
          capacity,
        })
        .where(eq(classrooms.id, id))
        .returning();

      return c.json({
        success: true,
        message: "Classroom updated successfully!",
        data: updatedData[0],
      });
    } catch (error) {
      console.error("Error updating classrooms:", error);
      throw new HTTPException(500, { message: "Error updating classrooms" });
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
        .from(classrooms)
        .where(eq(classrooms.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "Classroom not found",
          },
          404
        );
      }

      await db.delete(classrooms).where(eq(classrooms.id, id));

      return c.json({
        success: true,
        message: "Classroom deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting classrooms:", error);
      throw new HTTPException(500, { message: "Error deleting classrooms" });
    }
  });

export default app;
