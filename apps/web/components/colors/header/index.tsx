"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import PlusIcon from "@/components/icons/PlusIcon";
import { showModal } from "@/store/colors/form.slice";
import { useAppSelector } from "@/store";
import { cn } from "@/lib/utils";

const Header = () => {
  const dispatch = useDispatch();
  const total = useAppSelector((store) => store.colorStore.dataStore.total);

  return (
    <HeaderWrapper title="Colors" tagline={`${total} items`}>
      <div className={cn("flex items-center gap-1")}>
        <Button onClick={() => dispatch(showModal(true))} className="gap-2">
          <PlusIcon />
          Add New
        </Button>
      </div>
    </HeaderWrapper>
  );
};

export default Header;
