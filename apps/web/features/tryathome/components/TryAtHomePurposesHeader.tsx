"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import { useAppDispatch } from "@/store";
import { showModal } from "@/features/tryathome/store";

interface TryAtHomePurposesHeaderProps {}

const TryAtHomePurposesHeader: React.FC<TryAtHomePurposesHeaderProps> = () => {
  const dispatch = useAppDispatch();

  return (
    <HeaderWrapper
      title="Try At Home Purposes"
      tagline="Manage try at home purposes"
    >
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="rounded-3xl hover:bg-foreground hover:text-background animate-smooth"
          onClick={() => dispatch(showModal(true))}
        >
          Add Purpose
        </Button>
      </div>
    </HeaderWrapper>
  );
};

export default TryAtHomePurposesHeader;
