"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { client } from "@/lib/rpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { scheduleSchema } from "../schema";

type SubjectsResponseType = InferResponseType<
  (typeof client.api)["subjects"]["$get"]
>;

type TeachersResponseType = InferResponseType<
  (typeof client.api)["teachers"]["$get"]
>;

type ClassroomsResponseType = InferResponseType<
  (typeof client.api)["classrooms"]["$get"]
>;

type ResponseType = InferResponseType<
  (typeof client.api.schedules.create)["$post"]
>;

type RequestType = InferRequestType<
  (typeof client.api.schedules.create)["$post"]
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

export function SchedulesCreateDialog({
  open,
  onOpenChange,
  classId,
  schoolYearId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  schoolYearId: number;
}) {
  const form = useForm<z.infer<typeof scheduleSchema>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      classId,
      schoolYearId,
      dayOfWeek: "monday",
      startTime: timeSlots[0].start,
      endTime: timeSlots[0].end,
      isActive: true,
      classroomId: undefined,
      subjectId: undefined,
      teacherId: undefined,
    },
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.schedules.create["$post"]({
        json,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["schedules"] });
        queryClient.invalidateQueries({ queryKey: ["class", classId] });

        form.reset();
        onOpenChange(false);
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

  function onSubmit(values: z.infer<typeof scheduleSchema>) {
    mutate({
      json: values,
    });
  }

  const isLoading =
    isSubjectsDataLoading || isTeachersDataLoading || isClassroomsDataLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        form.reset();
      }}
    >
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Add New Schedule</DialogTitle>
          <DialogDescription>
            Create a new schedule for the class
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          {isLoading ? (
            <div>Loading data...</div>
          ) : !subjectsData || !teachersData || !classroomsData ? (
            <div>Failed to load required data</div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          <SelectValue placeholder="Select a day" />
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
                            <SelectValue placeholder="Select start time" />
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
                            <SelectValue placeholder="Select end time" />
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

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Schedule</Button>
              </div>
            </form>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
