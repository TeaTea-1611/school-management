import { ConfirmDialog } from "@/components/confirm-dialog";
import { useClassrooms } from "../context/classrooms-context";
import { ClassUpdateDrawer } from "./classrooms-update-drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType, InferRequestType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type DeleteTeacherResponseType = InferResponseType<
  (typeof client.api)["classrooms"][":id"]["$delete"]
>;

type DeleteTeacherRequestType = InferRequestType<
  (typeof client.api)["classrooms"][":id"]["$delete"]
>;

export function ClassroomsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useClassrooms();

  const queryClient = useQueryClient();

  const { mutate } = useMutation<
    DeleteTeacherResponseType,
    Error,
    DeleteTeacherRequestType
  >({
    mutationFn: async ({ param }) => {
      const response = await client.api["classrooms"][":id"]["$delete"]({
        param,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["classrooms"] });
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
          <ClassUpdateDrawer
            key={`classroom-update-drawer-${currentRow.id}`}
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
            key="classroom-delete-confirm-dialog"
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
            title={`Delete this classroom?`}
            desc={
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this classroom? This action
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
