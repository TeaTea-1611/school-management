"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { classSchema } from "../schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type SchoolYearsResponseType = InferResponseType<
  (typeof client.api)["school-years"]["$get"]
>;

type TeachersResponseType = InferResponseType<
  (typeof client.api)["teachers"]["$get"]
>;

type ResponseType = InferResponseType<
  (typeof client.api.classes.create)["$post"]
>;

type RequestType = InferRequestType<
  (typeof client.api.classes.create)["$post"]
>;

export function CreateClassForm() {
  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      capacity: 40,
    },
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.classes.create["$post"]({
        json,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        form.reset();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: teachersData, isLoading: isLoadingTeachers } =
    useQuery<TeachersResponseType>({
      queryKey: ["teachers"],
      queryFn: async () => {
        const response = await client.api["teachers"]["$get"]();
        return await response.json();
      },
    });

  const { data: schoolYearsData, isLoading: isLoadingSchoolYears } =
    useQuery<SchoolYearsResponseType>({
      queryKey: ["school-years"],
      queryFn: async () => {
        const response = await client.api["school-years"]["$get"]();
        return await response.json();
      },
    });

  function onSubmit(values: z.infer<typeof classSchema>) {
    mutate({
      json: values,
    });
  }

  if (isLoadingSchoolYears || isLoadingTeachers) {
    return <div>Loading...</div>;
  }

  if (!schoolYearsData || !teachersData) {
    return <div>Data not found</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="6A" {...field} />
              </FormControl>
              <FormDescription>
                This is the name of the class. For example, &quot;6A&quot;,
                &quot;7B&quot;, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="supervisorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supervisor</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a supervisor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachersData.teachers.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.firstName} {item.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                This is the teacher who will be the supervisor for this class.
              </FormDescription>
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
              <FormDescription>
                This is the school year for this class. For example,
                &quot;2023-2024&quot;, &quot;2024-2025&quot;, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Confirm</Button>
      </form>
    </Form>
  );
}
