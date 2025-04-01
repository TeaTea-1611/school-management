"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateSchoolYearForm } from "@/features/school-years/components/create-school-year-form";
import { SchoolYearsDialogs } from "@/features/school-years/components/school-years-dialog";
import { SchoolYearsTable } from "@/features/school-years/components/school-years-table";
import SchoolYearsProvider from "@/features/school-years/context/school-years-context";

export default function Page() {
  return (
    <SchoolYearsProvider>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl:grid-cols-2">
            <Card className="@container/card">
              <CardHeader>
                <CardTitle className="text-lg">
                  Create a new school year
                </CardTitle>
                <CardDescription className="text-balance">
                  Create a new school year to manage your students and classes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateSchoolYearForm />
              </CardContent>
            </Card>
          </div>
          <SchoolYearsTable />
        </div>
      </div>
      <SchoolYearsDialogs />
    </SchoolYearsProvider>
  );
}
