"use client";

import { Skeleton } from "@/components/ui/skeleton";
import RelatedShapeProductsSlider from "@/features/products/components/RelatedShapeProductsSlider";
import { useRelatedShapeProducts } from "@/features/products/queries/useRelatedShapeProducts";

export interface RelatedShapeProductsProps {
  shapeSlug?: string;
  shapeTitle?: string;
  excludeProductColorId?: string;
}

export default function RelatedShapeProducts({
  shapeSlug,
  shapeTitle,
  excludeProductColorId,
}: RelatedShapeProductsProps) {
  const { slides, isLoading, isError } = useRelatedShapeProducts({
    shapeSlug,
    shapeTitle,
    excludeProductColorId,
  });

  if (!shapeSlug) return null;
  if (isError) return null;
  if (isLoading) return <RelatedShapeProductsSkeleton shapeTitle={shapeTitle} />;
  if (!slides.length) return null;

  const heading = shapeTitle?.trim()
    ? `More in ${shapeTitle}`
    : "Related products";

  return (
    <section className="app-container mt-8 w-full min-w-0 py-4 md:mt-10 md:py-6">
      <h2 className="mb-3 px-1 text-lg font-semibold tracking-tight md:mb-4 md:text-xl">
        {heading}
      </h2>
      <RelatedShapeProductsSlider slides={slides} />
    </section>
  );
}

function RelatedShapeProductsSkeleton({
  shapeTitle,
}: {
  shapeTitle?: string;
}) {
  const heading = shapeTitle?.trim()
    ? `More in ${shapeTitle}`
    : "Related products";

  return (
    <section
      className="app-container mt-8 w-full min-w-0 py-4 md:mt-10 md:py-6"
      aria-hidden
    >
      <h2 className="mb-3 px-1 text-lg font-semibold tracking-tight md:mb-4 md:text-xl">
        {heading}
      </h2>
      <div className="flex gap-3 overflow-hidden px-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-[280px] w-[200px] shrink-0 rounded-xl sm:w-[220px]"
          />
        ))}
      </div>
    </section>
  );
}
