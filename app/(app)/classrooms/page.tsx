"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClassroomsDialogs } from "@/features/classrooms/components/classrooms-dialog";
import { ClassroomsTable } from "@/features/classrooms/components/classrooms-table";
import { CreateClassroomForm } from "@/features/classrooms/components/create-classroom-form";
import ClassroomsProvider from "@/features/classrooms/context/classrooms-context";

export default function Page() {
  return (
    <ClassroomsProvider>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
            <Card className="@container/card">
              <CardHeader>
                <CardTitle className="text-lg">
                  Create a new classroom
                </CardTitle>
                <CardDescription className="text-balance">
                  Create a new classroom.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateClassroomForm />
              </CardContent>
            </Card>
          </div>
          <ClassroomsTable />
        </div>
      </div>
      <ClassroomsDialogs />
    </ClassroomsProvider>
  );
}
