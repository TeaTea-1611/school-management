import { ConfirmDialog } from "@/components/confirm-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType, InferRequestType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useStudents } from "../context/students-context";
import { StudentsUpdateDrawer } from "./students-update-drawer";
import { StudentsCreateDialog } from "./students-create-dialog";
import { useParams } from "next/navigation";

type DeleteResponseType = InferResponseType<
  (typeof client.api)["students"][":id"]["$delete"]
>;

type DeleteRequestType = InferRequestType<
  (typeof client.api)["students"][":id"]["$delete"]
>;

export function StudentsDialogs() {
  const params = useParams<{ classId?: string }>();
  const classId = params.classId;
  const { open, setOpen, currentRow, setCurrentRow } = useStudents();

  const queryClient = useQueryClient();

  const { mutate } = useMutation<DeleteResponseType, Error, DeleteRequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api["students"][":id"]["$delete"]({
        param,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["students"] });
        if (classId) {
          queryClient.invalidateQueries({ queryKey: ["class", classId] });
        }
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
      <StudentsCreateDialog
        key="students-create"
        open={open === "create"}
        onOpenChange={() => setOpen("create")}
      />
      {currentRow && (
        <>
          <StudentsUpdateDrawer
            key={`student-update-drawer-${currentRow.id}`}
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
            key="student-delete-confirm-dialog"
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
            title={`Delete this student?`}
            desc={
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this student? This action cannot
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
