"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import Link from "next/link";
import { usePathname } from "next/navigation";
interface FranchiseRequestsHeaderProps {}

const FranchiseRequestsHeader: React.FC<FranchiseRequestsHeaderProps> = () => {
  const pathname = usePathname();
  const isRequestPage = pathname?.startsWith("/manage/franchises/requests");
  return (
    <HeaderWrapper
      title={isRequestPage ? "Franchise Requests" : "Active Franchises"}
      tagline="Manage franchises"
    >
      {!isRequestPage && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="rounded-3xl hover:bg-foreground hover:text-background animate-smooth"
            asChild
          >
            <Link href="/manage/franchises/requests">New Requests</Link>
          </Button>
        </div>
      )}
    </HeaderWrapper>
  );
};

export default FranchiseRequestsHeader;
