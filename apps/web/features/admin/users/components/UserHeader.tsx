"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import useQueryState from "@/hooks/use-query-state";
import { useAppSelector } from "@/store";
interface UserHeaderProps {}

const UserHeader: React.FC<UserHeaderProps> = () => {
  const {
    value: currentTab = "all",
    setValue: setTab,
    removeValue: removeTab,
  } = useQueryState<string>("tab", "all");
  const total = useAppSelector((state) => state.adminUsersStore.data.total);
  const blockedTotal = useAppSelector(
    (state) => state.adminUsersStore.data.blockedTotal,
  );
  const tabs = [
    { label: "All Users", value: "all", count: total },
    { label: "Blocked Users", value: "blocked", count: blockedTotal },
  ];

  const handleTabChange = (tabValue: string) => {
    if (tabValue === "all") {
      removeTab();
    } else {
      setTab(tabValue);
    }
  };

  return (
    <HeaderWrapper title="Users" tagline="Manage all users in the system">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={currentTab === tab.value ? "default" : "secondary"}
            size="sm"
            onClick={() => handleTabChange(tab.value)}
            className="rounded-3xl hover:bg-foreground hover:text-background animate-smooth"
          >
            {tab.label} ({tab.count})
          </Button>
        ))}
      </div>
    </HeaderWrapper>
  );
};

export default UserHeader;
