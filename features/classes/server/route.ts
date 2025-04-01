import { db } from "@/db";
import {
  classes,
  classrooms,
  schedules,
  schoolYears,
  students,
  subjects,
  teachers,
} from "@/db/schema";
import { zValidator } from "@hono/zod-validator";
import { and, asc, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { classSchema } from "../schema";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const data = await db
        .select({
          id: classes.id,
          name: classes.name,
          schoolYearId: classes.schoolYearId,
          supervisorId: classes.supervisorId,
          capacity: classes.capacity,
          schoolYear: {
            name: schoolYears.name,
          },
          supervisor: {
            firstName: teachers.firstName,
            lastName: teachers.lastName,
          },
        })
        .from(classes)
        .leftJoin(schoolYears, eq(classes.schoolYearId, schoolYears.id))
        .leftJoin(teachers, eq(teachers.id, classes.supervisorId))
        .orderBy(desc(classes.schoolYearId), asc(classes.name));

      return c.json({
        success: true,
        classes: data,
      });
    } catch (error) {
      console.error("Error fetching classes:", error);
      throw new HTTPException(500, { message: "Error fetching classes" });
    }
  })

  .get("/:id", async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        throw new Error("Invalid ID!");
      }

      const classData = await db
        .select({
          class: classes,
          supervisor: {
            id: teachers.id,
            firstName: teachers.firstName,
            lastName: teachers.lastName,
            phone: teachers.phone,
            email: teachers.email,
          },
          schoolYear: {
            id: schoolYears.id,
            name: schoolYears.name,
          },
        })
        .from(classes)
        .leftJoin(teachers, eq(classes.supervisorId, teachers.id))
        .leftJoin(schoolYears, eq(classes.schoolYearId, schoolYears.id))
        .where(eq(classes.id, id))
        .limit(1);

      if (classData.length === 0) {
        throw new Error("Class not found!");
      }

      const studentsData = await db
        .select()
        .from(students)
        .where(eq(students.classId, id))
        .orderBy(asc(students.firstName));

      const schedulesData = await db
        .select({
          schedule: {
            id: schedules.id,
            dayOfWeek: schedules.dayOfWeek,
            startTime: schedules.startTime,
            endTime: schedules.endTime,
            isActive: schedules.isActive,
          },
          subject: {
            id: subjects.id,
            name: subjects.name,
            description: subjects.description,
          },
          teacher: {
            id: teachers.id,
            firstName: teachers.firstName,
            lastName: teachers.lastName,
          },
          classroom: {
            id: classrooms.id,
            name: classrooms.name,
            capacity: classrooms.capacity,
            location: classrooms.location,
            floor: classrooms.floor,
            hasProjector: classrooms.hasProjector,
          },
        })
        .from(schedules)
        .leftJoin(subjects, eq(schedules.subjectId, subjects.id))
        .leftJoin(teachers, eq(schedules.teacherId, teachers.id))
        .leftJoin(classrooms, eq(schedules.classroomId, classrooms.id))
        .where(eq(schedules.classId, id));

      return c.json({
        class: classData[0].class,
        supervisor: classData[0].supervisor,
        schoolYear: classData[0].schoolYear,
        students: studentsData,
        schedules: schedulesData,
      });
    } catch (error) {
      console.error("Error fetching class details:", error);
      throw new HTTPException(500, { message: "Error fetching class details" });
    }
  })

  .post("/create", zValidator("json", classSchema), async (c) => {
    try {
      const { name, schoolYearId, supervisorId, capacity } =
        c.req.valid("json");

      const existingData = await db
        .select()
        .from(classes)
        .where(
          and(eq(classes.name, name), eq(classes.schoolYearId, schoolYearId))
        )
        .limit(1);

      if (existingData.length > 0) {
        return c.json(
          {
            success: false,
            message: "Class already exists!",
          },
          409
        );
      }

      const newData = await db
        .insert(classes)
        .values({
          name,
          schoolYearId,
          supervisorId,
          capacity,
        })
        .returning();

      return c.json(
        {
          success: true,
          message: "Class created successfully!",
          data: newData[0],
        },
        201
      );
    } catch (error) {
      console.error("Error creating classes:", error);
      throw new HTTPException(500, { message: "Error creating classes" });
    }
  })

  .patch("/:id", zValidator("json", classSchema), async (c) => {
    try {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid ID format" }, 400);
      }

      const { name, schoolYearId, supervisorId, capacity } =
        c.req.valid("json");

      const existingSchoolYear = await db
        .select()
        .from(classes)
        .where(eq(classes.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "Class not found",
          },
          404
        );
      }

      const duplicateName = await db
        .select()
        .from(classes)
        .where(
          and(eq(classes.name, name), eq(classes.schoolYearId, schoolYearId))
        )
        .limit(1);

      if (duplicateName.length > 0 && duplicateName[0].id !== id) {
        return c.json(
          {
            success: false,
            message: "Class already exists!",
          },
          409
        );
      }

      const updatedData = await db
        .update(classes)
        .set({
          name,
          schoolYearId,
          supervisorId,
          capacity,
        })
        .where(eq(classes.id, id))
        .returning();

      return c.json({
        success: true,
        message: "Class updated successfully!",
        data: updatedData[0],
      });
    } catch (error) {
      console.error("Error updating classes:", error);
      throw new HTTPException(500, { message: "Error updating classes" });
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
        .from(classes)
        .where(eq(classes.id, id))
        .limit(1);

      if (existingSchoolYear.length === 0) {
        return c.json(
          {
            success: false,
            message: "Class not found",
          },
          404
        );
      }

      await db.delete(classes).where(eq(classes.id, id));

      return c.json({
        success: true,
        message: "Class deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting classes:", error);
      throw new HTTPException(500, { message: "Error deleting classes" });
    }
  });

export default app;
