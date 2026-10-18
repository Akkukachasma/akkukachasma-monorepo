"use client";
import React from "react";
import HeaderWrapper from "@/components/navigation/admin/HeaderWrapper";
import { cn } from "@/lib/utils";
import useFetch from "@/lib/hooks/use-fetch";
import ENDPOINTS from "@/lib/endpoints";
import { useParams } from "next/navigation";
import { IBanner } from "../../ListItem";
import { Button } from "@/components/ui/button";
import EditIcon from "@/components/icons/EditIcon";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useAppDispatch } from "@/store";
import { showModal } from "@/store/banners/banner-image.slice";

const Header = () => {
  const dispatch = useAppDispatch();
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useFetch<IBanner>({
    endpoint: ENDPOINTS.admin.banners.fetch_one(params.id || ""),
    validate: true,
    enabledKey: params.id,
  });

  return (
    <HeaderWrapper
      title={data?.title || "No Title"}
      tagline={`${data?.banner_images?.length || 0} Images`}
    >
      <Button onClick={() => dispatch(showModal(true))} className="gap-2">
        <PlusIcon />
        Add New
      </Button>
    </HeaderWrapper>
  );
};

export default Header;
