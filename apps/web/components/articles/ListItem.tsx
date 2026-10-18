"use client";
import React from "react";
import DeleteIcon from "../icons/DeleteIcon";
import EditIcon from "../icons/EditIcon";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useAppDispatch } from "@/store";
import { IFile, IRecordMeta, ISeparatedProduct } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { setItemToDelete } from "@/store/articles/data.slice";
import { capitalizeFirstLetter } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { ArchiveIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import useUpdate from "@/lib/mutations/admin/articles/useUpdate";
export type ArticleStatus = "DRAFT" | "ARCHIVED" | "PUBLISHED";
export interface IArticle extends IRecordMeta {
  title: string;
  seo_title: string;
  description: string;
  content: string;
  thumbnail_alt?: string;
  category_ids?: string[];
  shape_ids?: string[];
  slug: string;
  keywords: string[];
  tags: string[];
  reading_time?: number | null;
  views: number;
  status: ArticleStatus;
  thumbnail?: IFile;
  related_products?: ISeparatedProduct[];
}

interface ListItemProps {
  data?: IArticle;
}

const ListItem: React.FC<ListItemProps> = ({ data }) => {
  const { id, ...rest } = data || {};
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { mutate: update, isPending: updating } = useUpdate(data?.id || "");

  if (!data) {
    return <ListItemSkeleton />;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="!p-0 h-full flex flex-col">
        <Avatar className="rounded-none w-full min-h-52 flex-shrink-0">
          <AvatarImage
            src={data?.thumbnail?.url}
            alt={"Image for power type"}
          />
          <AvatarFallback>
            {data.title?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow px-4 pb-4 pt-2 flex flex-col">
          <div className="flex-grow">
            <Badge
              variant={
                data?.status === "PUBLISHED"
                  ? "success"
                  : data?.status === "DRAFT"
                    ? "secondary"
                    : "destructive"
              }
              title={
                data?.status === "PUBLISHED"
                  ? "This post is currently live and visible on internet."
                  : data?.status === "DRAFT"
                    ? "This post is not published. May be it needs some improvements."
                    : "This post has been archived and it is not visible on page. If not restored it will be removed permanently withing 30 days of archiving."
              }
            >
              {data?.status === "PUBLISHED"
                ? "Live"
                : data?.status === "DRAFT"
                  ? "Unpublished"
                  : "Archived"}
            </Badge>
            <h3 className="text-lg font-semibold text-gray-800 capitalize">
              {data?.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {capitalizeFirstLetter(data?.seo_title)}
            </p>
          </div>
          <div className="flex items-baseline flex-shrink-0">
            <div className="flex items-end justify-end gap-2 flex-grow h-full">
              <Button
                variant="ghost"
                size="icon"
                disabled={updating}
                title={
                  data?.status === "PUBLISHED"
                    ? "Revert to draft"
                    : "Publish this post."
                }
                className="bg-success/10 hover:bg-success text-success hover:text-white ease-linear duration-300"
                onClick={() =>
                  update({
                    status:
                      data?.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                  })
                }
              >
                <PaperPlaneIcon className="-rotate-[30deg]" />
              </Button>
              <Button variant="secondary" size="icon" asChild>
                <Link href={`/manage/articles/${id}`} prefetch>
                  <EditIcon />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={updating}
                title={
                  data?.status === "ARCHIVED"
                    ? "Restore article"
                    : "Archive article."
                }
                className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white ease-linear duration-300"
                onClick={() =>
                  update({
                    status: data?.status === "ARCHIVED" ? "DRAFT" : "ARCHIVED",
                  })
                }
              >
                <ArchiveIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  dispatch(
                    setItemToDelete({
                      id: data?.id || "",
                      label: data.title || "",
                    }),
                  )
                }
                className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white ease-linear duration-300"
              >
                <DeleteIcon />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ListItemSkeleton = () => {
  return (
    <Card>
      <CardContent className="pt-6 h-full flex flex-col gap-2">
        <div className="flex flex-col gap-4">
          <Skeleton className="size-[100px]" />
          <div className="flex-grow flex flex-col gap-2">
            <Skeleton className="w-2/3" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-2" />
              <Skeleton className="h-2 w-4/5" />
              <Skeleton className="h-2 w-1/3" />
            </div>
          </div>
        </div>
        <div className="flex items-baseline flex-grow">
          <div className="flex items-end justify-end gap-2 flex-grow h-full">
            <Skeleton className="size-[40px] bg-secondary" />
            <Skeleton className="size-[40px] bg-destructive/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ListItem;
