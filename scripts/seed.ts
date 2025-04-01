import * as schema from "@/db/schema";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";

dotenv.config({ path: ".env.local" });

export const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log("Starting database seeding...");

    // Clear existing data (optional, remove if you don't want to clear data)
    await db.delete(schema.schedules);
    await db.delete(schema.studentParents);
    await db.delete(schema.students);
    await db.delete(schema.classes);
    await db.delete(schema.teachers);
    await db.delete(schema.subjects);
    await db.delete(schema.classrooms);
    await db.delete(schema.parents);
    await db.delete(schema.schoolYears);

    console.log("Existing data cleared. Starting fresh seed...");

    // Seed school years
    const schoolYears = ["2022-2023", "2023-2024", "2024-2025"];
    const insertedSchoolYears = await db
      .insert(schema.schoolYears)
      .values(schoolYears.map((sy) => ({ name: sy })))
      .returning();
    console.log("School years seeded successfully");

    // Seed subjects
    const subjectNames = [
      "Mathematics",
      "Literature",
      "English",
      "Physics",
      "Chemistry",
      "Biology",
      "History",
      "Geography",
      "Civic Education",
      "Informatics",
      "Technology",
      "Physical Education",
      "Music",
      "Fine Arts",
    ];

    const insertedSubjects = await db
      .insert(schema.subjects)
      .values(
        subjectNames.map((name) => ({
          name,
          description: faker.lorem.paragraph(),
        }))
      )
      .returning();
    console.log("Subjects seeded successfully");

    // Seed teachers (100 teachers)
    const teachers = [];
    for (let i = 1; i <= 100; i++) {
      teachers.push({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        dateOfBirth: faker.date
          .between({
            from: "1970-01-01",
            to: "1995-12-31",
          })
          .toISOString()
          .split("T")[0], // Convert to YYYY-MM-DD string
        gender: faker.helpers.arrayElement(["male", "female"]),
        phone: faker.phone.number({ style: "national" }),
        email: faker.internet.email(),
        address: faker.location.streetAddress({ useFullAddress: true }),
        qualification: faker.helpers.arrayElement([
          "Bachelor",
          "Master",
          "Doctor",
          "Professor",
        ]),
        joiningDate: faker.date
          .between({
            from: "2010-01-01",
            to: "2023-12-31",
          })
          .toISOString()
          .split("T")[0],
      });
    }

    const insertedTeachers = await db
      .insert(schema.teachers)
      .values(teachers)
      .returning();
    console.log("Teachers seeded successfully");

    // Seed classrooms
    const classrooms = [];
    const floors = ["A", "B", "C", "D"];

    for (const floor of floors) {
      for (let room = 1; room <= 5; room++) {
        classrooms.push({
          name: `Room ${floor}${room}`,
          capacity: faker.number.int({ min: 30, max: 45 }),
          location: `Area ${floor}`,
          floor: faker.number.int({ min: 1, max: 4 }),
          hasProjector: faker.datatype.boolean(),
        });
      }
    }

    const insertedClassrooms = await db
      .insert(schema.classrooms)
      .values(classrooms)
      .returning();
    console.log("Classrooms seeded successfully");

    // Seed classes
    const classNames = [];
    // Generate class names 6A-9C for each school year
    for (let grade = 6; grade <= 9; grade++) {
      for (const section of ["A", "B", "C", "D"]) {
        classNames.push(`${grade}${section}`);
      }
    }

    // Create classes for each school year
    const classes = [];
    for (const schoolYear of insertedSchoolYears) {
      for (const className of classNames) {
        classes.push({
          name: className,
          supervisorId:
            insertedTeachers[
              Math.floor(Math.random() * insertedTeachers.length)
            ].id,
          schoolYearId: schoolYear.id,
          capacity: faker.number.int({ min: 30, max: 40 }),
        });
      }
    }

    const insertedClasses = await db
      .insert(schema.classes)
      .values(classes)
      .returning();
    console.log("Classes seeded successfully");

    // Seed parents (generate enough for students)
    const parents = [];
    for (let i = 1; i <= 200; i++) {
      parents.push({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number({ style: "national" }),
        email: faker.internet.email(),
        address: faker.location.streetAddress({ useFullAddress: true }),
        occupation: faker.person.jobTitle(),
      });
    }

    const insertedParents = await db
      .insert(schema.parents)
      .values(parents)
      .returning();
    console.log("Parents seeded successfully");

    // Seed students (approximately 30 students per class)
    const students = [];

    for (const classObj of insertedClasses) {
      const numberOfStudents = faker.number.int({ min: 25, max: 35 });

      for (let i = 0; i < numberOfStudents; i++) {
        // Create student
        const student = {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          dateOfBirth: faker.date
            .between({
              from: "2008-01-01",
              to: "2013-12-31",
            })
            .toISOString()
            .split("T")[0],
          gender: faker.helpers.arrayElement(["male", "female"]),
          address: faker.location.streetAddress({ useFullAddress: true }),
          classId: classObj.id,
          schoolYearId: classObj.schoolYearId,
          // Assign a random parent as primary parent
          parentId:
            insertedParents[Math.floor(Math.random() * insertedParents.length)]
              .id,
        };

        students.push(student);
      }
    }

    const insertedStudents = await db
      .insert(schema.students)
      .values(students)
      .returning();
    console.log("Students seeded successfully");

    // Create parent-student relationships (each student gets 1-2 parents)
    const studentParentsRelations = [];

    // Tạo bản ghi mối quan hệ student-parent
    for (const student of insertedStudents) {
      // Mối quan hệ với phụ huynh chính
      const primaryRelationship = faker.helpers.arrayElement([
        "father",
        "mother",
      ]);

      const secondaryParentId =
        insertedParents[Math.floor(Math.random() * insertedParents.length)].id;

      // Xác định mối quan hệ của phụ huynh thứ hai
      const secondaryRelationship =
        primaryRelationship === "father" ? "mother" : "father";

      studentParentsRelations.push({
        studentId: student.id,
        parentId: secondaryParentId,
        relationship: secondaryRelationship,
      });
    }

    await db.insert(schema.studentParents).values(studentParentsRelations);
    console.log("Student-parent relationships seeded successfully");

    // Seed schedules
    const schedules = [];
    const daysOfWeek: (
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
    )[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    const timeSlots = [
      { start: "07:00", end: "07:45" },
      { start: "07:45", end: "08:30" },
      { start: "09:00", end: "09:45" },
      { start: "09:45", end: "10:30" },
      { start: "10:30", end: "11:15" },
      { start: "13:30", end: "14:15" },
      { start: "14:15", end: "15:00" },
      { start: "15:30", end: "16:15" },
      { start: "16:15", end: "17:00" },
    ];

    // Create schedules for each class
    for (const classObj of insertedClasses) {
      // Only create schedules for the active school year (2024-2025)
      const currentYearIndex = schoolYears.indexOf("2024-2025");
      if (classObj.schoolYearId !== insertedSchoolYears[currentYearIndex].id) {
        continue; // Skip inactive school years
      }

      // For each day of the week
      for (const day of daysOfWeek) {
        // For each time slot
        for (let i = 0; i < timeSlots.length; i++) {
          // Skip some periods randomly
          if (faker.number.int({ min: 1, max: 10 }) <= 1) continue;

          const timeSlot = timeSlots[i];

          schedules.push({
            classId: classObj.id,
            subjectId:
              insertedSubjects[
                Math.floor(Math.random() * insertedSubjects.length)
              ].id,
            teacherId:
              insertedTeachers[
                Math.floor(Math.random() * insertedTeachers.length)
              ].id,
            classroomId:
              insertedClassrooms[
                Math.floor(Math.random() * insertedClassrooms.length)
              ].id,
            schoolYearId: classObj.schoolYearId,
            dayOfWeek: day,
            startTime: timeSlot.start,
            endTime: timeSlot.end,
            isActive: true,
          });
        }
      }
    }

    await db.insert(schema.schedules).values(schedules);
    console.log("Schedules seeded successfully");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw new Error("Failed to seed the database");
  }
}

main();
