"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { schedules } from "@/db/schema";
import { client } from "@/lib/rpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferSelectModel } from "drizzle-orm";
import { InferRequestType, InferResponseType } from "hono";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useParams } from "next/navigation";
import { scheduleSchema } from "../schema";
import { useSchedules } from "../context/schedules-context";

type SubjectsResponseType = InferResponseType<
  (typeof client.api)["subjects"]["$get"]
>;

type TeachersResponseType = InferResponseType<
  (typeof client.api)["teachers"]["$get"]
>;

type ClassroomsResponseType = InferResponseType<
  (typeof client.api)["classrooms"]["$get"]
>;

type ClassesResponseType = InferResponseType<
  (typeof client.api)["classes"]["$get"]
>;

type SchoolYearsResponseType = InferResponseType<
  (typeof client.api)["school-years"]["$get"]
>;

type ResponseType = InferResponseType<
  (typeof client.api)["schedules"][":id"]["$patch"]
>;

type RequestType = InferRequestType<
  (typeof client.api)["schedules"][":id"]["$patch"]
>;

const timeSlots = [
  { start: "07:00", end: "07:45" },
  { start: "07:45", end: "08:30" },
  // { start: "08:30", end: "09:00" },
  { start: "09:00", end: "09:45" },
  { start: "09:45", end: "10:30" },
  { start: "10:30", end: "11:15" },
  { start: "13:30", end: "14:15" },
  { start: "14:15", end: "15:00" },
  // { start: "15:00", end: "15:30" },
  { start: "15:30", end: "16:15" },
  { start: "16:15", end: "17:00" },
];

const dayOfWeeks = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: InferSelectModel<typeof schedules>;
}

export function SchedulesUpdateDrawer({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const params = useParams<{ classId: string }>();
  const classId = params.classId;

  const form = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      ...currentRow,
      classId: currentRow.classId,
      schoolYearId: currentRow.schoolYearId,
      subjectId: currentRow.subjectId ?? undefined,
      teacherId: currentRow.teacherId ?? undefined,
      classroomId: currentRow.classroomId ?? undefined,
    },
  });

  const queryClient = useQueryClient();

  const { setOpen, setCurrentRow } = useSchedules();

  const { mutate, isPending } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api["schedules"][":id"]["$patch"]({
        json,
        param,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["schedules"] });
        queryClient.invalidateQueries({ queryKey: ["class", classId] });

        onOpenChange(false);
        form.reset();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: subjectsData, isLoading: isSubjectsDataLoading } =
    useQuery<SubjectsResponseType>({
      queryKey: ["subjects"],
      queryFn: async () => {
        const response = await client.api["subjects"]["$get"]();
        return await response.json();
      },
      enabled: open,
    });

  const { data: teachersData, isLoading: isTeachersDataLoading } =
    useQuery<TeachersResponseType>({
      queryKey: ["teachers"],
      queryFn: async () => {
        const response = await client.api["teachers"]["$get"]();
        return await response.json();
      },
      enabled: open,
    });

  const { data: classroomsData, isLoading: isClassroomsDataLoading } =
    useQuery<ClassroomsResponseType>({
      queryKey: ["classrooms"],
      queryFn: async () => {
        const response = await client.api["classrooms"]["$get"]();
        return await response.json();
      },
      enabled: open,
    });

  const { data: classesData, isLoading: isClassesDataLoading } =
    useQuery<ClassesResponseType>({
      queryKey: ["classes"],
      queryFn: async () => {
        const response = await client.api["classes"]["$get"]();
        return await response.json();
      },
      enabled: open,
    });

  const { data: schoolYearsData, isLoading: isSchoolYearDataLoading } =
    useQuery<SchoolYearsResponseType>({
      queryKey: ["school-years"],
      queryFn: async () => {
        const response = await client.api["school-years"]["$get"]();
        return await response.json();
      },
      enabled: open,
    });

  const onSubmit = (data: z.infer<typeof scheduleSchema>) => {
    mutate({
      param: {
        id: String(currentRow.id),
      },
      json: data,
    });
  };

  const isLoading =
    isSubjectsDataLoading ||
    isTeachersDataLoading ||
    isClassroomsDataLoading ||
    isClassesDataLoading ||
    isSchoolYearDataLoading;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        form.reset();
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>Update Schedule</SheetTitle>
          <SheetDescription>Update the schedule details.</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div>Loading...</div>
        ) : !subjectsData ||
          !teachersData ||
          !classroomsData ||
          !classesData ||
          !schoolYearsData ? (
          <div>Data not found</div>
        ) : (
          <>
            <Form {...form}>
              <form
                id="schedules-update-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex-1 space-y-5 p-4"
              >
                <FormField
                  control={form.control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dayOfWeeks.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((item) => (
                              <SelectItem key={item.start} value={item.start}>
                                {item.start}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((item) => (
                              <SelectItem key={item.end} value={item.end}>
                                {item.end}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="schoolYearId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Year</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={
                          field.value ? String(field.value) : undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a school year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schoolYearsData.schoolYears.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={
                          field.value ? String(field.value) : undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classesData.classes.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.name} ({item.schoolYear?.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={
                          field.value ? String(field.value) : undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjectsData.subjects.map((subject) => (
                            <SelectItem
                              key={subject.id}
                              value={String(subject.id)}
                            >
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={
                          field.value ? String(field.value) : undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachersData.teachers.map((teacher) => (
                            <SelectItem
                              key={teacher.id}
                              value={String(teacher.id)}
                            >
                              {teacher.firstName} {teacher.lastName} -{" "}
                              {teacher.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classroomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classroom</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={
                          field.value ? String(field.value) : undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a classroom" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classroomsData.classrooms.map((classroom) => (
                            <SelectItem
                              key={classroom.id}
                              value={String(classroom.id)}
                            >
                              {classroom.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <SheetFooter className="gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  setCurrentRow(currentRow);
                  setOpen("delete");
                }}
              >
                Remove
              </Button>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button
                form="schedules-update-form"
                type="submit"
                loading={isPending}
              >
                Save changes
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
