"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Tag,
} from "lucide-react";
import useDashboardOrderCounts from "../queries/useDashboardOrderCounts";
import useDashboardRevenueSummary from "../queries/useDashboardRevenueSummary";
import useDashboardProductCount from "../queries/useDashboardProductCount";
import useDashboardCategoryCount from "../queries/useDashboardCategoryCount";

const DashboardStats: React.FC = () => {
  const orderCounts = useDashboardOrderCounts();
  const revenue = useDashboardRevenueSummary();
  const products = useDashboardProductCount();
  const categories = useDashboardCategoryCount();

  const isLoading =
    orderCounts.isLoading ||
    revenue.isLoading ||
    products.isLoading ||
    categories.isLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="mb-2 h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!orderCounts.data || !revenue.data || !products.data || !categories.data) {
    return null;
  }

  const cards = [
    {
      title: "Orders",
      value: orderCounts.data.today,
      total: orderCounts.data.month,
      icon: ShoppingCart,
      color: "text-sky-600 dark:text-sky-400",
      bgColor: "bg-sky-50 dark:bg-sky-500/15",
      trend: "This month",
    },
    {
      title: "Revenue",
      value: `₹${revenue.data.today.toLocaleString()}`,
      total: `₹${revenue.data.month.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/15",
      trend: "This month",
    },
    {
      title: "Products",
      value: products.data.total,
      total: "Total",
      icon: Package,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-500/15",
      trend: "Catalog",
    },
    {
      title: "Categories",
      value: categories.data.total,
      total: "Total",
      icon: Tag,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-500/15",
      trend: "Active",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="overflow-hidden border-0 shadow-none"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {card.trend}
                </Badge>
                <span className="text-xs text-muted-foreground">{card.total}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
