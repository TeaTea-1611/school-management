"use client";

import { CustomSchedule } from "@/components/custom-schedule";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StudentsTable } from "@/features/students/components/students-table";
import StudentsProvider from "@/features/students/context/students-context";
import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

type ResponseType = InferResponseType<
  (typeof client.api)["classes"][":id"]["$get"]
>;

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, error } = useQuery<ResponseType>({
    queryKey: ["classes", id],
    queryFn: async () => {
      const response = await client.api.classes[":id"]["$get"]({
        param: { id },
      });

      return await response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">
          Error loading class data: {error?.message}
        </p>
      </div>
    );
  }

  if (!data) {
    return <p></p>;
  }

  return (
    <StudentsProvider>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
          <Card className="@container/card">
            <CardHeader>
              <CardTitle>Class: {data.class.name}</CardTitle>
              <CardDescription>
                Details for class {data.class.name} in school year{" "}
                {data.schoolYear?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Class Information</h3>
                <p>
                  <strong>Capacity:</strong> {data.class.capacity}
                </p>
                <p>
                  <strong>Supervisor:</strong> {data.supervisor?.firstName}{" "}
                  {data.supervisor?.lastName} ({data.supervisor?.email} -{" "}
                  {data.supervisor?.phone})
                </p>
                <p>
                  <strong>Total students:</strong> {data.students.length}{" "}
                  students
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="px-4 lg:px-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Schedules</h3>
          {data.schedules.length > 0 ? (
            <CustomSchedule
              data={data.schedules.map(({ schedule, subject, classroom }) => ({
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                title: `${subject?.name}`,
                sub: `(${classroom?.name})`,
              }))}
            />
          ) : (
            <p>No schedules available.</p>
          )}
        </div>
        <StudentsTable data={data.students} />
      </div>
    </StudentsProvider>
  );
}
