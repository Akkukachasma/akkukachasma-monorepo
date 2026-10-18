"use client";

import * as React from "react";
import type { IProductColorEmbedding } from "@/lib/types";
import { cn } from "@/lib/utils";
import ProductVideoCard from "./product-video-card";
import ProductEmbedCard from "./product-embed-card";

const EMBEDDINGS_GRID_CLASS =
  "grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2";

type ProductEmbeddingsSectionProps = {
  embeddings?: IProductColorEmbedding[];
  className?: string;
  title?: string;
};

function partitionEmbeddings(embeddings: IProductColorEmbedding[]) {
  const sorted = [...embeddings].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  const videos: IProductColorEmbedding[] = [];
  const embeds: IProductColorEmbedding[] = [];
  for (const item of sorted) {
    if (item.kind === "video") {
      videos.push(item);
    } else {
      embeds.push(item);
    }
  }
  return { videos, embeds };
}

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

export default function ProductEmbeddingsSection({
  embeddings,
  className,
  title = "See it in action",
}: ProductEmbeddingsSectionProps) {
  const { videos, embeds } = React.useMemo(
    () => partitionEmbeddings(embeddings ?? []),
    [embeddings],
  );

  if (videos.length === 0 && embeds.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("flex flex-col gap-6", className)}
      aria-label={title}
    >
      <h2 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
        {title}
      </h2>

      <div className="flex flex-col gap-6">
        {videos.length > 0 ? (
          <div className={EMBEDDINGS_GRID_CLASS}>
            {videos.map((embedding) => (
              <ProductVideoCard key={embedding.id} embedding={embedding} />
            ))}
          </div>
        ) : null}

        {embeds.length > 0 ? (
          <div className={EMBEDDINGS_GRID_CLASS}>
            {embeds.map((embedding) => (
              <LazyEmbedCell key={embedding.id} embedding={embedding} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
