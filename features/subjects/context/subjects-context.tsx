import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { InferSelectModel } from "drizzle-orm";
import { subjects } from "@/db/schema";

type SubjectsDialogType = "create" | "update" | "delete";

interface SubjectsContextType {
  open: SubjectsDialogType | null;
  setOpen: (str: SubjectsDialogType | null) => void;
  currentRow: InferSelectModel<typeof subjects> | null;
  setCurrentRow: React.Dispatch<
    React.SetStateAction<InferSelectModel<typeof subjects> | null>
  >;
}

const SubjectsContext = React.createContext<SubjectsContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function SubjectsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<SubjectsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<InferSelectModel<
    typeof subjects
  > | null>(null);
  return (
    <SubjectsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SubjectsContext>
  );
}

export const useSubjects = () => {
  const subjectsContext = React.useContext(SubjectsContext);

  if (!subjectsContext) {
    throw new Error("useSubjects has to be used within <SubjectsContext>");
  }

  return subjectsContext;
};
