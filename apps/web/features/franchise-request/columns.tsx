"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/features/data-table";
import { capitalizeFirstLetter } from "@/lib/utils";
import type { FranchiseRequest } from "./queries/useGetFranchiseRequests";

export interface FranchiseRequestColumnsOptions {
  showApprove: boolean;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  approvePendingId: string | null;
  deletePendingId: string | null;
}

function formatDate(value: string | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function createFranchiseRequestColumns({
  showApprove,
  onApprove,
  onDelete,
  approvePendingId,
  deletePendingId,
}: FranchiseRequestColumnsOptions): ColumnDef<FranchiseRequest>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[10rem] font-medium">
          {capitalizeFirstLetter(row.original.name)}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="max-w-[12rem] truncate" title={row.original.email}>
          {row.original.email}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }) => <div>{row.original.phone_number}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.owner}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "nearby",
      header: "Nearby",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.nearby}</div>
      ),
      enableSorting: false,
    },
    {
      id: "city",
      accessorFn: (row) => row.address?.city ?? "",
      header: "City",
      cell: ({ row }) => <div>{row.original.address?.city || "—"}</div>,
      enableSorting: false,
    },
    {
      id: "state",
      accessorFn: (row) => row.address?.state ?? "",
      header: "State",
      cell: ({ row }) => <div>{row.original.address?.state || "—"}</div>,
      enableSorting: false,
    },
    {
      id: "pincode",
      accessorFn: (row) => row.address?.zip_code ?? "",
      header: "Pincode",
      cell: ({ row }) => <div>{row.original.address?.zip_code || "—"}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) =>
        row.original.message ? (
          <div
            className="max-w-[10rem] truncate"
            title={row.original.message}
          >
            {row.original.message}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      enableSorting: false,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submitted" />
      ),
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatDate(row.original.created_at)}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const r = row.original;
        const approving = approvePendingId === r.id;
        const deleting = deletePendingId === r.id;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {showApprove ? (
                <>
                  <DropdownMenuItem
                    disabled={approving || r.status !== "pending"}
                    onClick={() => onApprove(r.id)}
                  >
                    <UserCheck className="mr-2 size-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={deleting}
                onClick={() => onDelete(r.id)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
