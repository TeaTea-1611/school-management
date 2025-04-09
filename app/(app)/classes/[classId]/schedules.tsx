"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { schedules } from "@/db/schema";
import { SchedulesCreateDialog } from "@/features/schedules/components/schedules-create-dialog";
import { SchedulesUpdateDrawer } from "@/features/schedules/components/schedules-update-drawer";
import { useSchedules } from "@/features/schedules/context/schedules-context";
import { IconPlus, IconPrinter } from "@tabler/icons-react";
import { InferSelectModel } from "drizzle-orm";
import { SchedulesTable } from "./schedules-table";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type DeleteResponseType = InferResponseType<
  (typeof client.api)["schedules"][":id"]["$delete"]
>;

type DeleteRequestType = InferRequestType<
  (typeof client.api)["schedules"][":id"]["$delete"]
>;

export function Schedules({
  classId,
  schoolYearId,
  data,
}: {
  classId: number;
  schoolYearId: number;
  data: (InferSelectModel<typeof schedules> & {
    subject: string;
    teacher: string;
    room: string;
  })[];
}) {
  const { open, setOpen, currentRow, setCurrentRow } = useSchedules();

  const queryClient = useQueryClient();

  const { mutate } = useMutation<DeleteResponseType, Error, DeleteRequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api["schedules"][":id"]["$delete"]({
        param,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["schedules"] });
        queryClient.invalidateQueries({ queryKey: ["class", classId] });

        setOpen(null);
        setTimeout(() => {
          setCurrentRow(null);
        }, 500);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h3 className="text-lg font-semibold">Schedules</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <IconPrinter />
            <span className="hidden lg:inline">Print</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOpen("create");
            }}
          >
            <IconPlus />
            <span className="hidden lg:inline">Add Schedule</span>
          </Button>
        </div>
      </div>
      <div className="px-4 lg:px-6 flex flex-col gap-4">
        <SchedulesTable data={data} />
      </div>
      <SchedulesCreateDialog
        classId={classId}
        schoolYearId={schoolYearId}
        open={open === "create"}
        onOpenChange={() => {
          setOpen("create");
        }}
      />
      {currentRow && (
        <>
          <SchedulesUpdateDrawer
            key={`schedule-update-drawer-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={() => {
              setOpen("update");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
          />
          <ConfirmDialog
            key={`schedule-delete-confirm-dialog-${currentRow.id}`}
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            handleConfirm={() => {
              mutate({
                param: {
                  id: String(currentRow.id),
                },
              });
            }}
            className="max-w-md"
            title={`Delete this schedule?`}
            desc={
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this schedule? This action
                cannot be undone.
              </p>
            }
            confirmText="Delete"
          />
        </>
      )}
      {/* CSS cho in ấn */}
      <style jsx global>{`
        @media print {
          /* Ẩn tất cả các phần tử trừ bảng lịch */
          body * {
            visibility: hidden;
          }
          .schedule-table,
          .schedule-table * {
            visibility: visible;
          }
          .schedule-table {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          /* Xoay trang sang ngang */
          @page {
            size: landscape;
            margin: 10mm; /* Giảm lề để tận dụng không gian */
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px; /* Giảm kích thước chữ để vừa trang */
          }
          th,
          td {
            border: 1px solid black;
            padding: 4px; /* Giảm padding để tiết kiệm không gian */
            vertical-align: top; /* Đảm bảo nội dung căn trên */
          }
          th {
            background-color: #f5f5f5;
            font-size: 10px;
            white-space: nowrap; /* Ngăn wrap text trong header */
          }
          td div {
            font-size: 10px;
            line-height: 1.2; /* Giảm khoảng cách dòng */
            margin-bottom: 2px; /* Giảm khoảng cách giữa các sự kiện */
          }
          /* Ngắt trang hợp lý */
          tr {
            page-break-inside: avoid; /* Tránh ngắt giữa hàng */
            page-break-after: auto;
          }
          /* Đảm bảo màu nền hiển thị khi in */
          .bg-blue-400\\/10 {
            background-color: #dbeafe !important;
          }
          .bg-purple-400\\/10 {
            background-color: #e9d5ff !important;
          }
          .bg-pink-400\\/10 {
            background-color: #fce7f3 !important;
          }
          .bg-green-400\\/10 {
            background-color: #dcfce7 !important;
          }
          .bg-yellow-400\\/10 {
            background-color: #fef9c3 !important;
          }
          .bg-teal-400\\/10 {
            background-color: #ccfbf1 !important;
          }
          .bg-red-400\\/10 {
            background-color: #fee2e2 !important;
          }
          .bg-orange-400\\/10 {
            background-color: #ffedd5 !important;
          }
          .bg-indigo-400\\/10 {
            background-color: #e0e7ff !important;
          }
          .bg-cyan-400\\/10 {
            background-color: #cffafe !important;
          }
          .bg-gray-400\\/10 {
            background-color: #e5e7eb !important;
          }
          .bg-lime-400\\/10 {
            background-color: #ecfccb !important;
          }
          .bg-rose-400\\/10 {
            background-color: #ffe4e6 !important;
          }
          .bg-amber-400\\/10 {
            background-color: #fef3c7 !important;
          }
          .bg-gray-500 {
            background-color: #6b7280 !important;
          }
        }
      `}</style>
    </>
  );
}
