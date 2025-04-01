import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { InferSelectModel } from "drizzle-orm";
import { teachers } from "@/db/schema";

type TeachersDialogType = "create" | "update" | "delete";

interface TeachersContextType {
  open: TeachersDialogType | null;
  setOpen: (str: TeachersDialogType | null) => void;
  currentRow: InferSelectModel<typeof teachers> | null;
  setCurrentRow: React.Dispatch<
    React.SetStateAction<InferSelectModel<typeof teachers> | null>
  >;
}

const TeachersContext = React.createContext<TeachersContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function TeachersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TeachersDialogType>(null);
  const [currentRow, setCurrentRow] = useState<InferSelectModel<
    typeof teachers
  > | null>(null);
  return (
    <TeachersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TeachersContext>
  );
}

export const useTeachers = () => {
  const teachersContext = React.useContext(TeachersContext);

  if (!teachersContext) {
    throw new Error("useTeachers has to be used within <TeachersContext>");
  }

  return teachersContext;
};
