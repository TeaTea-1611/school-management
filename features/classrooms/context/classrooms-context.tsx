import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { InferSelectModel } from "drizzle-orm";
import { classrooms } from "@/db/schema";

type ClassroomsDialogType = "create" | "update" | "delete";

interface ClassroomsContextType {
  open: ClassroomsDialogType | null;
  setOpen: (str: ClassroomsDialogType | null) => void;
  currentRow: InferSelectModel<typeof classrooms> | null;
  setCurrentRow: React.Dispatch<
    React.SetStateAction<InferSelectModel<typeof classrooms> | null>
  >;
}

const ClassroomsContext = React.createContext<ClassroomsContextType | null>(
  null
);

interface Props {
  children: React.ReactNode;
}

export default function ClassroomsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ClassroomsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<InferSelectModel<
    typeof classrooms
  > | null>(null);
  return (
    <ClassroomsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ClassroomsContext>
  );
}

export const useClassrooms = () => {
  const classroomsContext = React.useContext(ClassroomsContext);

  if (!classroomsContext) {
    throw new Error("useClassrooms has to be used within <ClassroomsContext>");
  }

  return classroomsContext;
};
