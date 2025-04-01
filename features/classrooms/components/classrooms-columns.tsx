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
import { classrooms } from "@/db/schema";
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { InferSelectModel } from "drizzle-orm";
import { useClassrooms } from "../context/classrooms-context";

export const columns: ColumnDef<InferSelectModel<typeof classrooms>>[] = [
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
      const { name } = row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{name}</span>
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
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "floor",
    header: "Floor",
  },
  {
    accessorKey: "hasProjector",
    header: "Has Projector",
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions row={row.original} />,
  },
];

const RowActions = ({ row }: { row: InferSelectModel<typeof classrooms> }) => {
  const { setOpen, setCurrentRow } = useClassrooms();

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
