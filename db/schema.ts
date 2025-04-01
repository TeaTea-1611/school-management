import {
  pgTable,
  serial,
  varchar,
  integer,
  date,
  text,
  boolean,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const gendersEnum = pgEnum("genders", ["male", "female"]);
export const daysEnum = pgEnum("days", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const schoolYears = pgTable("school_years", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // Ví dụ: "2024-2025"
});

export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique(),
  address: text("address").notNull(),
  occupation: varchar("occupation", { length: 100 }),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: gendersEnum("gender").notNull(),
  address: text("address"),
  classId: integer("class_id").references(() => classes.id),
  schoolYearId: integer("school_year_id")
    .references(() => schoolYears.id)
    .notNull(),
  parentId: integer("parent_id").references(() => parents.id),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: gendersEnum("gender").notNull(),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  address: text("address").notNull(),
  qualification: varchar("qualification", { length: 100 }).notNull(),
  joiningDate: date("joining_date").defaultNow().notNull(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
});

export const classes = pgTable(
  "classes",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(), // Ví dụ: "6A", "7B"
    supervisorId: integer("homeroom_teacher_id")
      .references(() => teachers.id)
      .notNull(),
    schoolYearId: integer("school_year_id")
      .references(() => schoolYears.id)
      .notNull(),
    capacity: integer("capacity").default(30).notNull(),
  },
  (t) => [unique("classUnique").on(t.name, t.schoolYearId)]
);

export const classrooms = pgTable("classrooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // Ví dụ: "Phòng A1"
  capacity: integer("capacity").notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  floor: integer("floor").notNull(),
  hasProjector: boolean("has_projector").default(false).notNull(),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  classId: integer("class_id")
    .references(() => classes.id)
    .notNull(),
  subjectId: integer("subject_id")
    .references(() => subjects.id)
    .notNull(),
  teacherId: integer("teacher_id")
    .references(() => teachers.id)
    .notNull(),
  classroomId: integer("classroom_id")
    .references(() => classrooms.id)
    .notNull(),
  schoolYearId: integer("school_year_id")
    .references(() => schoolYears.id)
    .notNull(),
  dayOfWeek: daysEnum("day_of_week").notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(), // Ví dụ: "07:30"
  endTime: varchar("end_time", { length: 5 }).notNull(), // Ví dụ: "08:15"
  isActive: boolean("is_active").default(true),
});

// Bảng trung gian để lưu mối quan hệ many-to-many giữa students và parents
export const studentParents = pgTable(
  "student_parents",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .references(() => students.id)
      .notNull(),
    parentId: integer("parent_id")
      .references(() => parents.id)
      .notNull(),
    relationship: varchar("relationship", { length: 50 }).notNull(), // e.g., "father", "mother", "guardian"
  },
  (t) => [unique("student_parent_unique").on(t.studentId, t.parentId)]
);

export const schoolYearsRelations = relations(schoolYears, ({ many }) => ({
  students: many(students),
  classes: many(classes),
  schedules: many(schedules),
}));

export const parentsRelations = relations(parents, ({ many }) => ({
  students: many(studentParents),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [students.schoolYearId],
    references: [schoolYears.id],
  }),
  parent: one(parents, {
    fields: [students.parentId],
    references: [parents.id],
  }),
  parents: many(studentParents),
}));

export const studentParentsRelations = relations(studentParents, ({ one }) => ({
  student: one(students, {
    fields: [studentParents.studentId],
    references: [students.id],
  }),
  parent: one(parents, {
    fields: [studentParents.parentId],
    references: [parents.id],
  }),
}));

export const teachersRelations = relations(teachers, ({ many }) => ({
  classes: many(classes),
  schedules: many(schedules),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  supervisor: one(teachers, {
    fields: [classes.supervisorId],
    references: [teachers.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [classes.schoolYearId],
    references: [schoolYears.id],
  }),
  students: many(students),
  schedules: many(schedules),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  schedules: many(schedules),
}));

export const classroomsRelations = relations(classrooms, ({ many }) => ({
  schedules: many(schedules),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  class: one(classes, {
    fields: [schedules.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [schedules.subjectId],
    references: [subjects.id],
  }),
  teacher: one(teachers, {
    fields: [schedules.teacherId],
    references: [teachers.id],
  }),
  classroom: one(classrooms, {
    fields: [schedules.classroomId],
    references: [classrooms.id],
  }),
  schoolYear: one(schoolYears, {
    fields: [schedules.schoolYearId],
    references: [schoolYears.id],
  }),
}));
