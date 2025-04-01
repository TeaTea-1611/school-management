import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { InferSelectModel } from "drizzle-orm";
import { students } from "@/db/schema";

type StudentsDialogType = "create" | "update" | "delete";

interface StudentsContextType {
  open: StudentsDialogType | null;
  setOpen: (str: StudentsDialogType | null) => void;
  currentRow: InferSelectModel<typeof students> | null;
  setCurrentRow: React.Dispatch<
    React.SetStateAction<InferSelectModel<typeof students> | null>
  >;
}

const StudentsContext = React.createContext<StudentsContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function StudentsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<StudentsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<InferSelectModel<
    typeof students
  > | null>(null);
  return (
    <StudentsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StudentsContext>
  );
}

export const useStudents = () => {
  const studentsContext = React.useContext(StudentsContext);

  if (!studentsContext) {
    throw new Error("useStudents has to be used within <StudentsContext>");
  }

  return studentsContext;
};
