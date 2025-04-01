import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { InferSelectModel } from "drizzle-orm";
import { schoolYears } from "@/db/schema";

type SchoolYearsDialogType = "create" | "update" | "delete";

interface SchoolYearsContextType {
  open: SchoolYearsDialogType | null;
  setOpen: (str: SchoolYearsDialogType | null) => void;
  currentRow: InferSelectModel<typeof schoolYears> | null;
  setCurrentRow: React.Dispatch<
    React.SetStateAction<InferSelectModel<typeof schoolYears> | null>
  >;
}

const SchoolYearsContext = React.createContext<SchoolYearsContextType | null>(
  null
);

interface Props {
  children: React.ReactNode;
}

export default function SchoolYearsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<SchoolYearsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<InferSelectModel<
    typeof schoolYears
  > | null>(null);
  return (
    <SchoolYearsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SchoolYearsContext>
  );
}

export const useSchoolYears = () => {
  const schoolYearsContext = React.useContext(SchoolYearsContext);

  if (!schoolYearsContext) {
    throw new Error(
      "useSchoolYears has to be used within <SchoolYearsContext>"
    );
  }

  return schoolYearsContext;
};
