"use client";
import LensFeature from "./LensFeature";
import { Button, ProcessIndicator } from "../ui/button";
import useLensFeatures from "@/lib/queries/admin/lens-features/useLensFeatures";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";

const LensFeatureList = () => {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useLensFeatures();
  const elementRef = useInfiniteScroll({
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        <LensFeature />
        <LensFeature />
        <LensFeature />
        <LensFeature />
        <LensFeature />
        <LensFeature />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {data?.map((d) => {
        return <LensFeature ref={elementRef} key={d.id} data={d} />;
      })}
    </div>
  );
};

export default LensFeatureList;
