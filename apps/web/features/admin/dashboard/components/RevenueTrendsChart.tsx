"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import useRevenueTrends from "../queries/useRevenueTrends";
import { DollarSign } from "lucide-react";

const RevenueTrendsChart: React.FC = () => {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const { data: trends, isLoading } = useRevenueTrends(period);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
            <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
            <Select
              value={period}
              onValueChange={(value) =>
                setPeriod(value as "week" | "month" | "year")
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No revenue data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = trends.map((trend) => ({
    date: new Date(trend.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: trend.revenue,
    orders: trend.orders,
    averageOrderValue: trend.averageOrderValue,
  }));

  const totalRevenue = trends.reduce((sum, t) => sum + t.revenue, 0);
  const totalOrders = trends.reduce((sum, t) => sum + t.orders, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Trends
          </CardTitle>
          <Select
            value={period}
            onValueChange={(value) =>
              setPeriod(value as "week" | "month" | "year")
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  `₹${value.toLocaleString()}`,
                  name === "revenue"
                    ? "Revenue"
                    : name === "averageOrderValue"
                      ? "Avg Order Value"
                      : "Orders",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalOrders}
            </div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ₹{averageOrderValue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Avg Order Value</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueTrendsChart;
