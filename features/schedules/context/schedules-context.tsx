import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { InferSelectModel } from "drizzle-orm";
import { schedules } from "@/db/schema";

type SchedulesDialogType = "create" | "update" | "delete";

interface SchedulesContextType {
  open: SchedulesDialogType | null;
  setOpen: (str: SchedulesDialogType | null) => void;
  currentRow: InferSelectModel<typeof schedules> | null;
  setCurrentRow: React.Dispatch<
    React.SetStateAction<InferSelectModel<typeof schedules> | null>
  >;
}

const SchedulesContext = React.createContext<SchedulesContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function SchedulesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<SchedulesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<InferSelectModel<
    typeof schedules
  > | null>(null);
  return (
    <SchedulesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SchedulesContext>
  );
}

export const useSchedules = () => {
  const schedulesContext = React.useContext(SchedulesContext);

  if (!schedulesContext) {
    throw new Error("useSchedules has to be used within <SchedulesContext>");
  }

  return schedulesContext;
};
