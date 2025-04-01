"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateSubjectForm } from "@/features/subjects/components/create-subject-form";
import { SubjectsDialogs } from "@/features/subjects/components/subjects-dialog";
import { SubjectsTable } from "@/features/subjects/components/subjects-table";
import SubjectsProvider from "@/features/subjects/context/subjects-context";

export default function Page() {
  return (
    <SubjectsProvider>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl:grid-cols-2">
            <Card className="@container/card">
              <CardHeader>
                <CardTitle className="text-lg">Create a new subject</CardTitle>
                <CardDescription className="text-balance">
                  Create a new subject.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateSubjectForm />
              </CardContent>
            </Card>
          </div>
          <SubjectsTable />
        </div>
      </div>
      <SubjectsDialogs />
    </SubjectsProvider>
  );
}
