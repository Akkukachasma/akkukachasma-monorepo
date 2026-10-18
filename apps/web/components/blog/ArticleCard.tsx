"use client";
import Image from "next/image";
import { Card } from "../ui/card";
import { IArticle } from "../articles/ListItem";
import { Button } from "../ui/button";
import dayjs from "dayjs";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
interface ArticleCardProps {
  data?: IArticle;
}
const ArticleCard: React.FC<ArticleCardProps> = ({ data }) => {
  if (!data) {
    return <div>loading...</div>;
  }
  return (
    <Card className="relative animate-smooth group p-4 md:p-8 shadow-none rounded-none border-none hover:bg-primary/5 cursor-pointer">
      <div className="h-1 w-full absolute bg-transparent group-hover:bg-primary/10 top-0 left-0 animate-smooth" />
      <div className="flex flex-col md:flex-row gap-4 md:gap-8f w-full">
        {data?.thumbnail?.url && (
          <div className="w-[200px] aspect-video relative">
            <Image
              src={data?.thumbnail?.url}
              alt="alt text for smaple post card"
              width={100}
              height={100}
              className="rounded-md w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-grow">
          <div className="flex justify-between items-center text-foreground text-xs uppercase font-medium tracking-wider">
            <span>
              {dayjs(data?.updated_at || data?.created_at).format(
                "MMM DD, YYYY",
              )}
            </span>
            <div className="lowercase flex items-center divide-x divide-foreground/20">
              <span className="px-2">{data?.reading_time || 0} min</span>
              <span className="px-2">
                {formatNumber(data?.views || 0)} view
                {data?.views === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold line-clamp-2 mt-1">
            {data?.title}
          </h2>
        </div>
      </div>
      <div className="py-4 sm:py-6">
        <p className="text-foreground/60 text-sm line-clamp-2">
          {data?.description}
        </p>
      </div>
      <div className="flex justify-end items-center w-full">
        <Button size="sm" variant="outline" asChild>
          <Link href={`/blog/${data?.slug}`}>Read full post</Link>
        </Button>
      </div>
    </Card>
  );
};

export default ArticleCard;
