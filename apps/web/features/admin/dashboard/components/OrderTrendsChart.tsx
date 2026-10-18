"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import useOrderTrends from "../queries/useOrderTrends";
import { TrendingUp } from "lucide-react";

const OrderTrendsChart: React.FC = () => {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const { data: trends, isLoading } = useOrderTrends(period);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Order Trends
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
              <TrendingUp className="h-5 w-5" />
              Order Trends
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
            No order data available for the selected period
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
    orders: trend.count,
    revenue: trend.revenue,
    confirmed: trend.statuses.confirmed,
    delivered: trend.statuses.delivered,
    cancelled: trend.statuses.cancelled,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Order Trends
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
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {trends.reduce((sum, t) => sum + t.count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{trends.reduce((sum, t) => sum + t.revenue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {trends.reduce((sum, t) => sum + t.statuses.delivered, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Delivered</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTrendsChart;
