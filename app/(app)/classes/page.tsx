"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClassesDialogs } from "@/features/classes/components/classes-dialog";
import { ClassesTable } from "@/features/classes/components/classes-table";
import { CreateClassForm } from "@/features/classes/components/create-class-form";
import ClassesProvider from "@/features/classes/context/classes-context";

export default function Page() {
  return (
    <ClassesProvider>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
            <Card className="@container/card">
              <CardHeader>
                <CardTitle className="text-lg">Create a new class</CardTitle>
                <CardDescription className="text-balance">
                  Create a new class to manage your students and classes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateClassForm />
              </CardContent>
            </Card>
          </div>
          <ClassesTable />
        </div>
      </div>
      <ClassesDialogs />
    </ClassesProvider>
  );
}
