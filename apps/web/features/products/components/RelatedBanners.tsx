"use client";

import { Skeleton } from "@/components/ui/skeleton";
import BannerRenderer from "@/components/banner-renderer";
import { useRelatedBanners } from "../queries/useRelatedBanners";

export interface RelatedBannersProps {
  categoryId?: string;
  shapeId?: string;
}

const RelatedBanners: React.FC<RelatedBannersProps> = ({
  categoryId,
  shapeId,
}) => {
  const { banners, isLoading, isError } = useRelatedBanners({
    categoryId,
    shapeId,
  });

  if (!categoryId && !shapeId) return null;
  if (isError) return null;
  if (isLoading) return <RelatedBannersSkeleton />;
  if (!banners?.length) return null;

  return (
    <div className="mt-6 md:mt-8 w-full overflow-hidden">
      {banners.map((banner) => (
        <BannerRenderer
          key={banner.id}
          banner={banner}
          layout="product"
          className="py-4 md:py-6 first:pt-0"
        />
      ))}
    </div>
  );
};

function RelatedBannersSkeleton() {
  return (
    <div className="mt-6 md:mt-8 w-full space-y-4" aria-hidden="true">
      <Skeleton className="h-[120px] w-full rounded-lg md:h-[160px]" />
      <Skeleton className="h-[80px] w-full rounded-lg md:h-[100px]" />
    </div>
  );
}

export default RelatedBanners;
