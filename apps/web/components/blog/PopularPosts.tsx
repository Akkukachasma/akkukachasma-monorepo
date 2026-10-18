"use client";
import React from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import useFetch from "@/lib/hooks/use-fetch";
import ENDPOINTS from "@/lib/endpoints";
import "swiper/css";
import HeroSliderTemplate from "./HeroSliderTemplate";
import { IArticle } from "../articles/ListItem";
import { Skeleton } from "../ui/skeleton";
interface PopularPostsProps {
  height?: number;
  articles?: IArticle[];
}
const PopularPosts: React.FC<PopularPostsProps> = ({
  height,
  articles = [],
}) => {
  const { data, isLoading } = useFetch<IArticle[]>({
    endpoint: ENDPOINTS.blog.fetch_popular,
    initialData: articles,
  });

  const list = data || [];

  if (isLoading && list.length === 0) {
    return <PopularPostsSkeleton height={height} />;
  }

  if (list.length === 0) {
    return null;
  }

  return (
    <div className="" style={{ height }}>
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        pagination={{
          clickable: true,
        }}
        className="mySwiper"
        rewind
        autoplay
      >
        {list.map((d, index: number) => (
          <SwiperSlide
            style={{ height }}
            key={d.id ?? index}
            className="h-full w-full"
          >
            <HeroSliderTemplate data={d} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

const PopularPostsSkeleton: React.FC<{ height?: number }> = ({ height }) => {
  return (
    <div style={{ height }} className="flex flex-col gap-6 md:pt-4 lg:pt-14">
      <div className="flex flex-col gap-4 md:gap-12 lg:gap-16 xl:gap-20 md:flex-row py-5 flex-shrink-0">
        <Skeleton className="h-16 w-full md:h-20" />
        <div className="w-80 flex-shrink-0 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <Skeleton className="w-full aspect-video" />
    </div>
  );
};

export default PopularPosts;
