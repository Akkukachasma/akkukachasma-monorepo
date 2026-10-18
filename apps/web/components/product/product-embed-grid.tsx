"use client";

import * as React from "react";
import type { IProductColorEmbedding } from "@/lib/types";
import { cn } from "@/lib/utils";
import ProductEmbedCard from "./product-embed-card";

function useLazyVisible(rootMargin = "120px") {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible };
}

function LazyEmbedCell({ embedding }: { embedding: IProductColorEmbedding }) {
  const { ref, visible } = useLazyVisible();
  return (
    <div ref={ref}>
      <ProductEmbedCard embedding={embedding} active={visible} />
    </div>
  );
}

type ProductEmbedGridProps = {
  embeddings: IProductColorEmbedding[];
  className?: string;
};

export default function ProductEmbedGrid({
  embeddings,
  className,
}: ProductEmbedGridProps) {
  if (embeddings.length === 0) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2",
        className,
      )}
    >
      {embeddings.map((embedding) => (
        <LazyEmbedCell key={embedding.id} embedding={embedding} />
      ))}
    </div>
  );
}
