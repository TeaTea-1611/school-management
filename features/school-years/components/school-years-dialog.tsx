import { ConfirmDialog } from "@/components/confirm-dialog";
import { useSchoolYears } from "../context/school-years-context";
import { SchoolYearUpdateDrawer } from "./school-years-update-drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType, InferRequestType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type DeleteSchoolYearResponseType = InferResponseType<
  (typeof client.api)["school-years"][":id"]["$delete"]
>;

type DeleteSchoolYearRequestType = InferRequestType<
  (typeof client.api)["school-years"][":id"]["$delete"]
>;

export function SchoolYearsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSchoolYears();

  const queryClient = useQueryClient();

  const { mutate } = useMutation<
    DeleteSchoolYearResponseType,
    Error,
    DeleteSchoolYearRequestType
  >({
    mutationFn: async ({ param }) => {
      const response = await client.api["school-years"][":id"]["$delete"]({
        param,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["school-years"] });
        setOpen(null);
        setTimeout(() => {
          setCurrentRow(null);
        }, 500);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      {currentRow && (
        <>
          <SchoolYearUpdateDrawer
            key={`school-year-update-drawer-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={() => {
              setOpen("update");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
          />
          <ConfirmDialog
            key="school-year-delete-confirm-dialog"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            handleConfirm={() => {
              mutate({
                param: {
                  id: String(currentRow.id),
                },
              });
            }}
            className="max-w-md"
            title={`Delete this school year?`}
            desc={
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this school year? This action
                cannot be undone.
              </p>
            }
            confirmText="Delete"
          />
        </>
      )}
    </>
  );
}
