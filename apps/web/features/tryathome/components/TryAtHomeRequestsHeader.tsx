"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TryAtHomeRequestsHeaderProps {}

const TryAtHomeRequestsHeader: React.FC<TryAtHomeRequestsHeaderProps> = () => {
  const pathname = usePathname();
  const isPurposesPage = pathname?.startsWith("/manage/try-at-home/purposes");

  return (
    <HeaderWrapper
      title={isPurposesPage ? "Try At Home Purposes" : "Try At Home Requests"}
      tagline="Manage try at home requests and purposes"
    >
      <div className="flex items-center gap-2">
        {!isPurposesPage && (
          <Button
            size="sm"
            className="rounded-3xl hover:bg-foreground hover:text-background animate-smooth"
            asChild
          >
            <Link href="/manage/try-at-home/purposes">Manage Purposes</Link>
          </Button>
        )}
        {isPurposesPage && (
          <Button
            size="sm"
            className="rounded-3xl hover:bg-foreground hover:text-background animate-smooth"
            asChild
          >
            <Link href="/manage/try-at-home">View Requests</Link>
          </Button>
        )}
      </div>
    </HeaderWrapper>
  );
};

export default TryAtHomeRequestsHeader;
