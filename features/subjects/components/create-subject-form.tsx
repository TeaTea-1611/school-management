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
import { Input } from "@/components/ui/input";
import { client } from "@/lib/rpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { subjectSchema } from "../schema";

type ResponseType = InferResponseType<
  (typeof client.api)["subjects"]["create"]["$post"]
>;

type RequestType = InferRequestType<
  (typeof client.api)["subjects"]["create"]["$post"]
>;

export function CreateSubjectForm() {
  const form = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api["subjects"]["create"]["$post"]({
        json,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
        form.reset();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof subjectSchema>) {
    mutate({
      json: values,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Confirm</Button>
      </form>
    </Form>
  );
}
