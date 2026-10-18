"use client";
import React from "react";
import DashboardStats from "@/features/admin/dashboard/components/DashboardStats";
import OrderTrendsChart from "@/features/admin/dashboard/components/OrderTrendsChart";
import CategoryTrendsChart from "@/features/admin/dashboard/components/CategoryTrendsChart";
import RevenueTrendsChart from "@/features/admin/dashboard/components/RevenueTrendsChart";
import TodaysOrdersCard from "@/features/admin/dashboard/components/TodaysOrdersCard";
import NotificationsCard from "@/features/admin/dashboard/components/NotificationsCard";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import PageWrapper from "@/components/wrappers/PageWrapper";

const DashboardPage: React.FC = () => {
  return (
    <div>
      <HeaderWrapper
        title="Dashboard"
        tagline="Overview of your business performance and key metrics"
      />
      <PageWrapper className="space-y-6">
        {/* Stats Cards */}
        <DashboardStats />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrderTrendsChart />
          <RevenueTrendsChart />
        </div>

        {/* Category Trends */}
        <CategoryTrendsChart />

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodaysOrdersCard />
          <NotificationsCard />
        </div>
      </PageWrapper>
    </div>
  );
};

export default DashboardPage;
