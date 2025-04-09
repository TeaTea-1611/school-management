"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { client } from "@/lib/rpc";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { InferRequestType, InferResponseType } from "hono";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { studentSchema } from "../schema";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClassesResponseType = InferResponseType<
  (typeof client.api)["classes"]["$get"]
>;

type SchoolYearsResponseType = InferResponseType<
  (typeof client.api)["school-years"]["$get"]
>;

type ResponseType = InferResponseType<
  (typeof client.api.students.create)["$post"]
>;

type RequestType = InferRequestType<
  (typeof client.api.students.create)["$post"]
>;

export function StudentsCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const params = useParams<{ classId?: string }>();
  const classId = params.classId;

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      gender: "male",
      dateOfBirth: format(new Date(), "yyyy-MM-dd"),
      classId: classId ? Number(classId) : undefined,
    },
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.students.create["$post"]({
        json,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["students"] });
        if (classId) {
          queryClient.invalidateQueries({ queryKey: ["class", classId] });
        }
        form.reset();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
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

  function onSubmit(values: z.infer<typeof studentSchema>) {
    mutate({
      json: values,
    });
  }

  if (isSchoolYearDataLoading || isClassesDataLoading) {
    return <div>Loading...</div>;
  }

  if (!schoolYearsData || !classesData) {
    return <div>Data not found</div>;
  }

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
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
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
                      {["male", "female"].map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
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
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(field.value)}
                        onSelect={(day) => {
                          field.onChange(day ? format(day, "yyyy-MM-dd") : "");
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schoolYearId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Year</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
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
                  <FormLabel>class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
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
            <Button type="submit">Confirm</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
