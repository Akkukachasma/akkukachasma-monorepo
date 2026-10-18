"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export type OrderUiFilters = {
  search: string;
  status: string;
  payment_status: string;
  payment_mode: string;
  sort_by: string;
  start_date: string;
  end_date: string;
};

type OrderFiltersFormProps = {
  uiFilters: OrderUiFilters;
  onFilterChange: (key: keyof OrderUiFilters, value: string) => void;
};

const OrderFiltersForm: React.FC<OrderFiltersFormProps> = ({
  uiFilters,
  onFilterChange,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="relative sm:col-span-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          placeholder="Search by customer name or email..."
          value={uiFilters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-10"
        />
      </div>

      <Select
        value={uiFilters.status}
        onValueChange={(value) => onFilterChange("status", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Order Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="initiated">Initiated</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="picked">Picked</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={uiFilters.payment_status}
        onValueChange={(value) => onFilterChange("payment_status", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payment Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={uiFilters.payment_mode}
        onValueChange={(value) => onFilterChange("payment_mode", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Payment Mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payment Modes</SelectItem>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="cod">Cash on Delivery</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={uiFilters.sort_by}
        onValueChange={(value) => onFilterChange("sort_by", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_desc">Newest First</SelectItem>
          <SelectItem value="created_asc">Oldest First</SelectItem>
          <SelectItem value="name_asc">Customer A-Z</SelectItem>
          <SelectItem value="name_desc">Customer Z-A</SelectItem>
          <SelectItem value="recently_updated">Recently Updated</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        placeholder="Start date"
        value={uiFilters.start_date}
        onChange={(e) => onFilterChange("start_date", e.target.value)}
        className="flex-1"
      />

      <Input
        type="date"
        placeholder="End date"
        value={uiFilters.end_date}
        onChange={(e) => onFilterChange("end_date", e.target.value)}
        className="flex-1"
      />
    </div>
  );
};

export default OrderFiltersForm;
