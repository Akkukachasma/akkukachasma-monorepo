"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import PlusIcon from "@/components/icons/PlusIcon";
import { useAppSelector } from "@/store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";

const Header = () => {
  const total = useAppSelector((store) => store.articleStore.dataStore.total);

  return (
    <HeaderWrapper title="Articles" tagline={`${total} items`}>
      <div className={cn("flex items-center gap-1")}>
        <Button className="gap-2" asChild>
          <Link href="/manage/articles/new">
            <PlusIcon />
            Add New
          </Link>
        </Button>
      </div>
    </HeaderWrapper>
  );
};

export default Header;
