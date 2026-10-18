"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import useGetUsers from "../queries/useGetUsers";
import useGetBlockedUsersCount from "../queries/useGetBlockedUsersCount";
import User from "./User";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import useUpdateUser from "../mutations/useUpdateUser";
import useBlockUser from "../mutations/useBlockUser";
import useUnblockUser from "../mutations/useUnblockUser";
import useQueryState from "@/hooks/use-query-state";
import { useAppSelector } from "@/store";

const PAGE_SIZE = 12;

interface UserListProps {}

const UserList: React.FC<UserListProps> = () => {
  const { value: currentTab = "all" } = useQueryState<string>("tab", "all");

  // Separate UI filter state from debounced API filter state
  const [uiFilters, setUiFilters] = useState({
    search: "",
    role: "all",
    sort_by: "created_desc",
    blocked: currentTab === "blocked" ? "true" : "",
    page_size: PAGE_SIZE,
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
  // Update blocked filter when tab changes
  useEffect(() => {
    setUiFilters((prev) => ({
      ...prev,
      blocked: currentTab === "blocked" ? "true" : "",
    }));
  }, [currentTab]);

  const {
    data: users,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    query,
  } = useGetUsers(filters);
  const elementRef = useInfiniteScroll({
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  });

  // Blocked users count is now in the store
  const total = useAppSelector((state) => state.adminUsersStore.data.total);
  const blockedTotal = useAppSelector(
    (state) => state.adminUsersStore.data.blockedTotal,
  );

  // Update UI filter state only (does not trigger API immediately)
  const handleFilterChange = (key: string, value: string) => {
    setUiFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const updateUserMutation = useUpdateUser();
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <User key={i} loading />
        ))}
      </div>
    );
  }
  if (query.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load users</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
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
                placeholder="Search by name or email..."
                value={uiFilters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={uiFilters.role}
              onValueChange={(value) => handleFilterChange("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Results */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {currentTab === "blocked" ? "Blocked Users" : "All Users"} (
          {currentTab === "blocked" ? blockedTotal : total})
        </h2>
      </div>
      {/* Users List */}
      <div className="grid grid-cols-1 gap-4">
        {!users?.length ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                {currentTab === "blocked"
                  ? "No blocked users found"
                  : "No users found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          users.map((user, idx) => (
            <User
              key={user.id}
              user={user}
              ref={idx === users.length - 1 ? elementRef : undefined}
              onEdit={async (id, data) => {
                await updateUserMutation.mutateAsync({ id, data });
              }}
              onBlock={async (id) => {
                await blockUserMutation.mutateAsync(id);
              }}
              onUnblock={async (id) => {
                await unblockUserMutation.mutateAsync(id);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
