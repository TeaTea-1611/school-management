import { ConfirmDialog } from "@/components/confirm-dialog";
import { useTeachers } from "../context/teachers-context";
import { TeacherUpdateDrawer } from "./teachers-update-drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType, InferRequestType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type DeleteTeacherResponseType = InferResponseType<
  (typeof client.api)["teachers"][":id"]["$delete"]
>;

type DeleteTeacherRequestType = InferRequestType<
  (typeof client.api)["teachers"][":id"]["$delete"]
>;

export function TeachersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTeachers();

  const queryClient = useQueryClient();

  const { mutate } = useMutation<
    DeleteTeacherResponseType,
    Error,
    DeleteTeacherRequestType
  >({
    mutationFn: async ({ param }) => {
      const response = await client.api["teachers"][":id"]["$delete"]({
        param,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["teachers"] });
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
          <TeacherUpdateDrawer
            key={`teacher-update-drawer-${currentRow.id}`}
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
            key="teacher-delete-confirm-dialog"
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
            title={`Delete this teacher?`}
            desc={
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this teacher? This action cannot
                be undone.
              </p>
            }
            confirmText="Delete"
          />
        </>
      )}
    </>
  );
}
