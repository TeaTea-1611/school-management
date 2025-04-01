"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InferSelectModel } from "drizzle-orm";
import { schoolYears } from "@/db/schema";
import { schoolYearSchema } from "../schema";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api)["school-years"][":id"]["$patch"]
>;

type RequestType = InferRequestType<
  (typeof client.api)["school-years"][":id"]["$patch"]
>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: InferSelectModel<typeof schoolYears>;
}

export function SchoolYearUpdateDrawer({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const form = useForm<z.infer<typeof schoolYearSchema>>({
    resolver: zodResolver(schoolYearSchema),
    defaultValues: {
      name: currentRow.name,
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api["school-years"][":id"]["$patch"]({
        json,
        param,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["school-years"] });
        onOpenChange(false);
        form.reset();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: z.infer<typeof schoolYearSchema>) => {
    mutate({
      param: {
        id: String(currentRow.id),
      },
      json: {
        name: data.name,
      },
    });
  };

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
          <SheetTitle>Update School Year</SheetTitle>
          <SheetDescription>Update the school year details.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="school-year-update-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-5 p-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>School Year</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="2024-2025" />
                  </FormControl>
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
            form="school-year-update-form"
            type="submit"
            loading={isPending}
          >
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
