import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { InferSelectModel } from "drizzle-orm";
import { classes } from "@/db/schema";

type ClassesDialogType = "create" | "update" | "delete";

interface ClassesContextType {
  open: ClassesDialogType | null;
  setOpen: (str: ClassesDialogType | null) => void;
  currentRow: InferSelectModel<typeof classes> | null;
  setCurrentRow: React.Dispatch<
    React.SetStateAction<InferSelectModel<typeof classes> | null>
  >;
}

const ClassesContext = React.createContext<ClassesContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function ClassesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ClassesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<InferSelectModel<
    typeof classes
  > | null>(null);
  return (
    <ClassesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ClassesContext>
  );
}

export const useClasses = () => {
  const classesContext = React.useContext(ClassesContext);

  if (!classesContext) {
    throw new Error("useClasses has to be used within <ClassesContext>");
  }

  return classesContext;
};
