import { ConfirmDialog } from "@/components/confirm-dialog";
import { useSubjects } from "../context/subjects-context";
import { SubjectUpdateDrawer } from "./subjects-update-drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType, InferRequestType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type DeleteSubjectResponseType = InferResponseType<
  (typeof client.api)["subjects"][":id"]["$delete"]
>;

type DeleteSubjectRequestType = InferRequestType<
  (typeof client.api)["subjects"][":id"]["$delete"]
>;

export function SubjectsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSubjects();

  const queryClient = useQueryClient();

  const { mutate } = useMutation<
    DeleteSubjectResponseType,
    Error,
    DeleteSubjectRequestType
  >({
    mutationFn: async ({ param }) => {
      const response = await client.api["subjects"][":id"]["$delete"]({
        param,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
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
          <SubjectUpdateDrawer
            key={`subject-update-drawer-${currentRow.id}`}
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
            key="subject-delete-confirm-dialog"
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
            title={`Delete this subject?`}
            desc={
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this subject? This action cannot
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
