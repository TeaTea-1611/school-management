import * as schema from "@/db/schema";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";

dotenv.config({ path: ".env.local" });

export const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  try {
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

    console.log("Database reset completed successfully!");
  } catch (error) {
    console.error("Error during reseting:", error);
    throw new Error("Failed to reset the database");
  }
}

main();
