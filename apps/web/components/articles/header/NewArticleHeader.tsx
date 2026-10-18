"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import AdminHeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import PlusIcon from "@/components/icons/PlusIcon";
import { useAppSelector } from "@/store";
import { cn } from "@/lib/utils";
import Link from "next/link";

const Header = () => {
  return (
    <AdminHeaderWrapper title="Update Article">
      <div className={cn("flex items-center gap-1")}>
        <Button className="gap-2" asChild>
          <Link href="/articles/preview">
            <PlusIcon />
            Preview
          </Link>
        </Button>
      </div>
    </AdminHeaderWrapper>
  );
};

export default Header;
