"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import PageWrapper from "@/components/wrappers/PageWrapper";
import ActivitiesList from "./List";
import { ActivitiesHeader } from "..";

const ActivityPageContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceSearch = useDebounce((v: string) => setDebouncedSearchTerm(v), 400);
  useEffect(() => {
    debounceSearch(searchTerm);
  }, [searchTerm, debounceSearch]);

  const [sortBy, setSortBy] = useState("created_desc");
  const [typeFilter, setTypeFilter] = useState<string>("INFO");
  const pageSize = 12;

  const filters = {
    search_term: debouncedSearchTerm,
    sort_by: sortBy,
    type: typeFilter === "all" ? undefined : typeFilter,
    page_size: pageSize,
  };

  const handleFilterChange = (key: string, value: string | number) => {
    if (key === "search_term") setSearchTerm(String(value));
    else if (key === "sort_by") setSortBy(String(value));
    else if (key === "type") setTypeFilter(String(value));
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <ActivitiesHeader>
        <div className="flex items-center gap-3">
          <div className="relative w-56 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search title, description, user..."
              value={searchTerm}
              onChange={(e) => handleFilterChange("search_term", e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={(v) => handleFilterChange("type", v)}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
              <SelectItem value="WARNING">Warning</SelectItem>
              <SelectItem value="ALERT">Alert</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(v) => handleFilterChange("sort_by", v)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">Newest First</SelectItem>
              <SelectItem value="created_asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ActivitiesHeader>
      <PageWrapper>
        <ActivitiesList filters={filters} />
      </PageWrapper>
    </div>
  );
};

export default ActivityPageContent;
