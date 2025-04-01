"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { teachers } from "@/db/schema";
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { InferSelectModel } from "drizzle-orm";
import { useTeachers } from "../context/teachers-context";

export const columns: ColumnDef<InferSelectModel<typeof teachers>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstName",
    header: "First name",
    cell: ({ row }) => {
      const { firstName } = row.original;
      return (
        <div className="flex items-center gap-2">
          <span>{firstName}</span>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "lastName",
    header: "Last name",
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "qualification",
    header: "Qualification",
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions teacher={row.original} />,
  },
];

const RowActions = ({
  teacher,
}: {
  teacher: InferSelectModel<typeof teachers>;
}) => {
  const { setOpen, setCurrentRow } = useTeachers();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(teacher);
            setOpen("update");
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            setCurrentRow(teacher);
            setOpen("delete");
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
