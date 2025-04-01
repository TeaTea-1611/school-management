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
import { classes } from "@/db/schema";
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { InferSelectModel } from "drizzle-orm";
import { useClasses } from "../context/classes-context";
import Link from "next/link";

export const columns: ColumnDef<
  InferSelectModel<typeof classes> & {
    schoolYear: {
      name: string;
    } | null;
    supervisor: {
      firstName: string;
      lastName: string;
    } | null;
  }
>[] = [
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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const { name, schoolYear } = row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{name}</span>
          <span className="underline underline-offset-1 text-xs">
            ({schoolYear?.name})
          </span>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "supervisor",
    header: "Supervisor",
    cell: ({ row }) => {
      const { supervisor } = row.original;
      return (
        <div className="flex items-center gap-2">
          <span>
            {supervisor?.firstName} {supervisor?.lastName}
          </span>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions row={row.original} />,
  },
];

const RowActions = ({
  row,
}: {
  row: InferSelectModel<typeof classes> & {
    schoolYear: {
      name: string;
    } | null;
    supervisor: {
      firstName: string;
      lastName: string;
    } | null;
  };
}) => {
  const { setOpen, setCurrentRow } = useClasses();

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
        <DropdownMenuItem asChild>
          <Link href={`/classes/${row.id}`}>Details</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row);
            setOpen("update");
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            setCurrentRow(row);
            setOpen("delete");
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
