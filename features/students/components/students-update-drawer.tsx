"use client";

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
import { classes } from "@/db/schema";
import { client } from "@/lib/rpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferSelectModel } from "drizzle-orm";
import { InferRequestType, InferResponseType } from "hono";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { classSchema } from "../schema";

type SchoolYearsResponseType = InferResponseType<
  (typeof client.api)["school-years"]["$get"]
>;

type ClasssResponseType = InferResponseType<
  (typeof client.api)["teachers"]["$get"]
>;

type ResponseType = InferResponseType<
  (typeof client.api)["classes"][":id"]["$patch"]
>;

type RequestType = InferRequestType<
  (typeof client.api)["classes"][":id"]["$patch"]
>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: InferSelectModel<typeof classes>;
}

export function ClassUpdateDrawer({ open, onOpenChange, currentRow }: Props) {
  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      ...currentRow,
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api["classes"][":id"]["$patch"]({
        json,
        param,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        onOpenChange(false);
        form.reset();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: teachersData, isLoading: isLoadingClasss } =
    useQuery<ClasssResponseType>({
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

  const onSubmit = (data: z.infer<typeof classSchema>) => {
    mutate({
      param: {
        id: String(currentRow.id),
      },
      json: data,
    });
  };

  if (isLoadingSchoolYears || isLoadingClasss) {
    return <div>Loading...</div>;
  }

  if (!schoolYearsData || !teachersData) {
    return <div>Data not found</div>;
  }

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
          <SheetTitle>Update Class</SheetTitle>
          <SheetDescription>Update the class details.</SheetDescription>
        </SheetHeader>
        {isLoadingSchoolYears || isLoadingClasss ? (
          <div>Loading...</div>
        ) : !schoolYearsData || !teachersData ? (
          <div>Data not found</div>
        ) : (
          <>
            <Form {...form}>
              <form
                id="class-update-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex-1 space-y-5 p-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
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
                        This is the teacher who will be the supervisor for this
                        class.
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
              </form>
            </Form>
            <SheetFooter className="gap-2">
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
              <Button
                form="class-update-form"
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
