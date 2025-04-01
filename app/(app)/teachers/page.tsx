"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeachersDialogs } from "@/features/teachers/components/teachers-dialog";
import { TeachersTable } from "@/features/teachers/components/teachers-table";
import SchoolYearsProvider from "@/features/teachers/context/teachers-context";
import { CreateTeacherForm } from "@/features/teachers/components/create-teacher-form";

export default function Page() {
  return (
    <SchoolYearsProvider>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
            <Card className="@container/card">
              <CardHeader>
                <CardTitle className="text-lg">Create a new teacher</CardTitle>
                <CardDescription className="text-balance">
                  Create a new teacher to manage your students and classes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateTeacherForm />
              </CardContent>
            </Card>
          </div>
          <TeachersTable />
        </div>
      </div>
      <TeachersDialogs />
    </SchoolYearsProvider>
  );
}
