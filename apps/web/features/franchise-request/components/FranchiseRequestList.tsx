"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getCoreRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import useGetFranchiseRequests, {
  type FranchiseRequestStatus,
} from "../queries/useGetFranchiseRequests";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setSearchTerm,
  setSortBy,
  setEmail,
  setPhoneNumber,
  setStartDate,
  setEndDate,
  setPage,
} from "../store/franchise-requests.slice";
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  DataTableViewOptions,
} from "@/features/data-table";
import { createFranchiseRequestColumns } from "../columns";
import useApproveFranchiseRequest from "../mutations/useApproveFranchiseRequest";
import useDeleteFranchiseRequest from "../mutations/useDeleteFranchiseRequest";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

function sortByToSorting(sort_by: string): SortingState {
  switch (sort_by) {
    case "name_asc":
      return [{ id: "name", desc: false }];
    case "name_desc":
      return [{ id: "name", desc: true }];
    case "created_asc":
      return [{ id: "created_at", desc: false }];
    case "created_desc":
      return [{ id: "created_at", desc: true }];
    case "recently_updated":
      return [{ id: "created_at", desc: true }];
    default:
      return [{ id: "created_at", desc: true }];
  }
}

export interface FranchiseRequestListProps {
  status: FranchiseRequestStatus;
  listTitle: string;
}

const FranchiseRequestList: React.FC<FranchiseRequestListProps> = ({
  status,
  listTitle,
}) => {
  const dispatch = useAppDispatch();
  const {
    page,
    search_term,
    sort_by,
    email,
    phone_number,
    start_date,
    end_date,
  } = useAppSelector((state) => state.franchiseRequestStore.data);

  const [uiFilters, setUiFilters] = useState({
    search: search_term,
    email: email,
    phone: phone_number,
    start_date: start_date,
    end_date: end_date,
  });
  const [filters, setFilters] = useState(uiFilters);

  const debouncedSetFilters = useDebounce((newFilters: typeof uiFilters) => {
    setFilters(newFilters);
  }, 400);

  useEffect(() => {
    debouncedSetFilters(uiFilters);
  }, [uiFilters, debouncedSetFilters]);

  useEffect(() => {
    dispatch(setSearchTerm(filters.search));
    dispatch(setEmail(filters.email));
    dispatch(setPhoneNumber(filters.phone));
    dispatch(setStartDate(filters.start_date));
    dispatch(setEndDate(filters.end_date));
  }, [filters, dispatch]);

  const filterKey = useRef({
    search_term: "",
    email: "",
    phone_number: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    const prev = filterKey.current;
    if (
      prev.search_term !== search_term ||
      prev.email !== email ||
      prev.phone_number !== phone_number ||
      prev.start_date !== start_date ||
      prev.end_date !== end_date
    ) {
      dispatch(setPage(1));
    }
    filterKey.current = {
      search_term,
      email,
      phone_number,
      start_date,
      end_date,
    };
  }, [
    search_term,
    email,
    phone_number,
    start_date,
    end_date,
    dispatch,
  ]);

  useEffect(() => {
    dispatch(setPage(1));
  }, [status, dispatch]);

  const {
    data,
    isLoading,
    isFetching,
    pageCount,
    pageSize,
    total,
  } = useGetFranchiseRequests({ status, page_size: PAGE_SIZE });

  const approveMutation = useApproveFranchiseRequest();
  const deleteMutation = useDeleteFranchiseRequest();

  const approvePendingId =
    approveMutation.isPending && approveMutation.variables
      ? approveMutation.variables
      : null;
  const deletePendingId =
    deleteMutation.isPending && deleteMutation.variables
      ? deleteMutation.variables
      : null;

  const columns = useMemo(
    () =>
      createFranchiseRequestColumns({
        showApprove: status === "pending",
        onApprove: (id) => approveMutation.mutate(id),
        onDelete: (id) => deleteMutation.mutate(id),
        approvePendingId,
        deletePendingId,
      }),
    [
      status,
      approveMutation,
      deleteMutation,
      approvePendingId,
      deletePendingId,
    ],
  );

  const sorting = useMemo(() => sortByToSorting(sort_by), [sort_by]);

  const [columnVisibility, setColumnVisibility] = useState({});

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination: { pageIndex: page - 1, pageSize },
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      if (!first) {
        dispatch(setSortBy("created_desc"));
        return;
      }
      if (first.id === "name") {
        dispatch(setSortBy(first.desc ? "name_desc" : "name_asc"));
      } else if (first.id === "created_at") {
        dispatch(setSortBy(first.desc ? "created_desc" : "created_asc"));
      }
    },
    onPaginationChange: (updater) => {
      const current = { pageIndex: page - 1, pageSize };
      const next = typeof updater === "function" ? updater(current) : updater;
      dispatch(setPage(next.pageIndex + 1));
    },
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleFilterChange = (key: string, value: string) => {
    setUiFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={uiFilters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="Filter by email..."
              value={uiFilters.email}
              onChange={(e) => handleFilterChange("email", e.target.value)}
            />
            <Input
              placeholder="Filter by phone..."
              value={uiFilters.phone}
              onChange={(e) => handleFilterChange("phone", e.target.value)}
            />
            <div className="flex gap-2 md:col-span-2 lg:col-span-4">
              <Input
                type="date"
                value={uiFilters.start_date}
                onChange={(e) =>
                  handleFilterChange("start_date", e.target.value)
                }
                className="flex-1"
              />
              <Input
                type="date"
                value={uiFilters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">
          {listTitle} ({total})
        </h2>
      </div>

      <DataTableToolbar className="py-0">
        <div className="flex w-full flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <DataTableViewOptions table={table} />
        </div>
      </DataTableToolbar>

      {isLoading ? (
        <div className="space-y-2 rounded-md border p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              {Array.from({ length: 6 }).map((__, j) => (
                <Skeleton key={j} className="h-10 flex-1" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "space-y-0",
            isFetching && "opacity-70 transition-opacity",
          )}
        >
          <DataTable
            table={table}
            columns={columns}
            emptyMessage="No franchise requests found."
          />
          {pageCount > 1 ? (
            <DataTablePagination
              page={page}
              pageCount={pageCount}
              onPageChange={(p) => dispatch(setPage(p))}
              disabled={isFetching}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default FranchiseRequestList;
