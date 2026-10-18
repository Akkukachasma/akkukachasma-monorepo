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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import useCategoryTrends from "../queries/useCategoryTrends";
import { Tag } from "lucide-react";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const CategoryTrendsChart: React.FC = () => {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const { data: trends, isLoading } = useCategoryTrends(period);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Category Trends
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
              <Tag className="h-5 w-5" />
              Category Trends
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
            No category data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = trends.slice(0, 6).map((trend, index) => ({
    name: trend.name,
    revenue: trend.revenue,
    orders: trend.orders,
    items: trend.items,
    color: COLORS[index % COLORS.length],
  }));

  const pieData = trends.slice(0, 6).map((trend, index) => ({
    name: trend.name,
    value: trend.revenue,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Category Trends
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {trends.length}
            </div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ₹{trends.reduce((sum, t) => sum + t.revenue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {trends.reduce((sum, t) => sum + t.orders, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryTrendsChart;
