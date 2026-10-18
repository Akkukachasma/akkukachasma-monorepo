"use client";

import * as React from "react";
import type { IProductColorEmbedding } from "@/lib/types";
import { cn } from "@/lib/utils";
import ProductEmbeddingRenderer from "./ProductEmbeddingRenderer";

type ProductEmbeddingsSectionProps = {
  embeddings?: IProductColorEmbedding[];
  className?: string;
  title?: string;
};

function LazyEmbeddingCard({
  embedding,
}: {
  embedding: IProductColorEmbedding;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className="overflow-hidden rounded-2xl border border-border/70 bg-card/40 shadow-sm"
    >
      <ProductEmbeddingRenderer embedding={embedding} active={visible} />
    </article>
  );
}

export default function ProductEmbeddingsSection({
  embeddings,
  className,
  title = "See it in action",
}: ProductEmbeddingsSectionProps) {
  const sorted = React.useMemo(() => {
    if (!embeddings?.length) return [];
    return [...embeddings].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
  }, [embeddings]);

  if (sorted.length === 0) return null;

  return (
    <section className={cn("flex flex-col gap-4", className)} aria-label={title}>
      <h2 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
        {title}
      </h2>
      <div className="flex flex-col gap-5">
        {sorted.map((embedding) => (
          <LazyEmbeddingCard key={embedding.id} embedding={embedding} />
        ))}
      </div>
    </section>
  );
}
