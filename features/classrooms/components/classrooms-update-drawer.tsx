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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { classrooms } from "@/db/schema";
import { client } from "@/lib/rpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferSelectModel } from "drizzle-orm";
import { InferRequestType, InferResponseType } from "hono";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { classroomSchema } from "../schema";

type SchoolYearsResponseType = InferResponseType<
  (typeof client.api)["school-years"]["$get"]
>;

type ClasssResponseType = InferResponseType<
  (typeof client.api)["teachers"]["$get"]
>;

type ResponseType = InferResponseType<
  (typeof client.api)["classrooms"][":id"]["$patch"]
>;

type RequestType = InferRequestType<
  (typeof client.api)["classrooms"][":id"]["$patch"]
>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: InferSelectModel<typeof classrooms>;
}

export function ClassUpdateDrawer({ open, onOpenChange, currentRow }: Props) {
  const form = useForm<z.infer<typeof classroomSchema>>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      ...currentRow,
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api["classrooms"][":id"]["$patch"]({
        json,
        param,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["classrooms"] });
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

  const onSubmit = (data: z.infer<typeof classroomSchema>) => {
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
          <SheetTitle>Update Classroom</SheetTitle>
          <SheetDescription>Update the classroom details.</SheetDescription>
        </SheetHeader>
        {isLoadingSchoolYears || isLoadingClasss ? (
          <div>Loading...</div>
        ) : !schoolYearsData || !teachersData ? (
          <div>Data not found</div>
        ) : (
          <>
            <Form {...form}>
              <form
                id="classroom-update-form"
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
                        <Input placeholder="A1" {...field} />
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasProjector"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Has projector
                        </FormLabel>
                        <FormDescription></FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled
                          aria-readonly
                        />
                      </FormControl>
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
                form="classroom-update-form"
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
