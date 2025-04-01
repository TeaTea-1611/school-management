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
import { client } from "@/lib/rpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { schoolYearSchema } from "../schema";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api)["school-years"]["create"]["$post"]
>;

type RequestType = InferRequestType<
  (typeof client.api)["school-years"]["create"]["$post"]
>;

export function CreateSchoolYearForm() {
  const form = useForm<z.infer<typeof schoolYearSchema>>({
    resolver: zodResolver(schoolYearSchema),
    defaultValues: {
      name: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api["school-years"]["create"]["$post"]({
        json,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["school-years"] });
        form.reset();
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof schoolYearSchema>) {
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
              <FormLabel>School Year</FormLabel>
              <FormControl>
                <Input placeholder="2024-2025" {...field} />
              </FormControl>
              <FormDescription>
                The school year is used to manage your students and classes.
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
