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
import { Filter, Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetInquiries, useDeleteInquiry } from "@/features/admin/inquiries";
import Inquiry from "./Inquiry";

const InquiryList = () => {
  // UI state for filters
  const [uiFilters, setUiFilters] = useState({
    search_term: "",
    source: "all",
    email: "",
    sort_by: "created_desc",
    page: 1,
    page_size: 10,
  });

  // Debounced filter state for API
  const [filters, setFilters] = useState(uiFilters);

  // Debounce filter changes
  const debouncedSetFilters = useDebounce((newFilters: typeof uiFilters) => {
    setFilters(newFilters);
  }, 400);

  // When UI filters change, debounce the API call
  useEffect(() => {
    debouncedSetFilters(uiFilters);
  }, [uiFilters, debouncedSetFilters]);

  const { data, isLoading, error } = useGetInquiries(filters);
  const deleteInquiryMutation = useDeleteInquiry();

  // Update UI filter state only (does not trigger API immediately)
  const handleFilterChange = (key: string, value: string) => {
    setUiFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleDelete = (inquiryId: string) => {
    deleteInquiryMutation.mutate(inquiryId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Inquiry key={i} loading />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load inquiries</p>
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
                value={uiFilters.search_term}
                onChange={(e) =>
                  handleFilterChange("search_term", e.target.value)
                }
                className="pl-10"
              />
            </div>
            <Select
              value={uiFilters.source}
              onValueChange={(value) => handleFilterChange("source", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="contact_us">Contact Us</SelectItem>
                <SelectItem value="product_page">Product Page</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by email..."
              value={uiFilters.email}
              onChange={(e) => handleFilterChange("email", e.target.value)}
            />
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
          Inquiries ({data?.total || 0})
        </h2>
      </div>
      {/* Inquiries List */}
      <div className="space-y-4">
        {!data?.data || data.data.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No inquiries found</p>
            </CardContent>
          </Card>
        ) : (
          data.data.map((inquiry) => (
            <Inquiry
              key={inquiry.id}
              inquiry={inquiry}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
      {/* Pagination */}
      {data && data.total > data.page_size && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={uiFilters.page <= 1}
            onClick={() =>
              setUiFilters((prev) => ({ ...prev, page: prev.page - 1 }))
            }
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {uiFilters.page} of {Math.ceil(data.total / data.page_size)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={uiFilters.page >= Math.ceil(data.total / data.page_size)}
            onClick={() =>
              setUiFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default InquiryList;
