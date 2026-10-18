"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import useGetTryAtHomeRequests from "../queries/useGetTryAtHomeRequests";
import useGetTryAtHomePurposes from "../queries/useGetTryAtHomePurposes";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import TryAtHomeRequestListItem from "./TryAtHomeRequestListItem";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setSearchTerm,
  setSortBy,
  setPurposeId,
  setStartDate,
  setEndDate,
} from "@/features/tryathome/store";

const PAGE_SIZE = 12;

const TryAtHomeRequestsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { total, search_term, sort_by, purpose_id, start_date, end_date } =
    useAppSelector((state) => state.tryAtHomeRequests.data);

  // Separate UI filter state from debounced API filter state
  const [uiFilters, setUiFilters] = useState({
    search: search_term,
    purpose: purpose_id || "all",
    sort_by: sort_by,
    start_date: start_date,
    end_date: end_date,
  });
  const [filters, setFilters] = useState(uiFilters);

  // Debounce filter changes
  const debouncedSetFilters = useDebounce((newFilters: typeof uiFilters) => {
    setFilters(newFilters);
  }, 400);

  // When UI filters change, debounce the API call
  useEffect(() => {
    debouncedSetFilters(uiFilters);
  }, [uiFilters, debouncedSetFilters]);

  // Update Redux state when filters change
  useEffect(() => {
    dispatch(setSearchTerm(filters.search));
    dispatch(setSortBy(filters.sort_by));
    dispatch(setPurposeId(filters.purpose === "all" ? "" : filters.purpose));
    dispatch(setStartDate(filters.start_date));
    dispatch(setEndDate(filters.end_date));
  }, [filters, dispatch]);

  const {
    data: requests,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetTryAtHomeRequests();

  const { data: purposes } = useGetTryAtHomePurposes();

  const elementRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  });

  // Update UI filter state only (does not trigger API immediately)
  const handleFilterChange = (key: string, value: string) => {
    setUiFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Filters Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 w-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <table
          className="ak-table"
          style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Purpose</th>
              <th>Address</th>
              <th>Message</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <TryAtHomeRequestListItem key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={uiFilters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={uiFilters.purpose}
              onValueChange={(value) => handleFilterChange("purpose", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All purposes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All purposes</SelectItem>
                {purposes?.map((purpose) => (
                  <SelectItem key={purpose.id} value={purpose.id}>
                    {purpose.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={uiFilters.sort_by}
              onValueChange={(value) => handleFilterChange("sort_by", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Newest First</SelectItem>
                <SelectItem value="created_asc">Oldest First</SelectItem>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="name_desc">Name Z-A</SelectItem>
                <SelectItem value="recently_updated">
                  Recently Updated
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Start date"
                value={uiFilters.start_date}
                onChange={(e) =>
                  handleFilterChange("start_date", e.target.value)
                }
                className="flex-1"
              />
              <Input
                type="date"
                placeholder="End date"
                value={uiFilters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Try At Home Requests ({total})
        </h2>
      </div>

      {/* Requests List */}
      {!requests?.length ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No requests found</p>
          </CardContent>
        </Card>
      ) : (
        <table
          className="ak-table"
          style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Purpose</th>
              <th>Address</th>
              <th>Message</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, index) => (
              <TryAtHomeRequestListItem
                key={req.id}
                data={req}
                ref={index === requests.length - 1 ? elementRef : undefined}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TryAtHomeRequestsList;
