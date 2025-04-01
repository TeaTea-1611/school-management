import { Hono } from "hono";
import { handle } from "hono/vercel";
import classes from "@/features/classes/server/route";
import classrooms from "@/features/classrooms/server/route";
import schoolYears from "@/features/school-years/server/route";
import subjects from "@/features/subjects/server/route";
import teachers from "@/features/teachers/server/route";

// export const runtime = "edge";

const app = new Hono()
  .basePath("/api")
  .route("/classes", classes)
  .route("/classrooms", classrooms)
  .route("/school-years", schoolYears)
  .route("/teachers", teachers)
  .route("/subjects", subjects);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof app;
