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
import { subjects } from "@/db/schema";
import { subjectSchema } from "../schema";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api)["subjects"][":id"]["$patch"]
>;

type RequestType = InferRequestType<
  (typeof client.api)["subjects"][":id"]["$patch"]
>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: InferSelectModel<typeof subjects>;
}

export function SubjectUpdateDrawer({ open, onOpenChange, currentRow }: Props) {
  const form = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: currentRow.name,
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api["subjects"][":id"]["$patch"]({
        json,
        param,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
        onOpenChange(false);
        form.reset();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: z.infer<typeof subjectSchema>) => {
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
          <SheetTitle>Update Subject</SheetTitle>
          <SheetDescription>Update the subject details.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="subject-update-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-5 p-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Subject</FormLabel>
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
          <Button form="subject-update-form" type="submit" loading={isPending}>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
