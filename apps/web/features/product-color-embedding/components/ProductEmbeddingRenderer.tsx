"use client";

import * as React from "react";
import type { IProductColorEmbedding } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildEmbeddingStreamSrc } from "../lib/build-embedding-stream-src";

type ProductEmbeddingRendererProps = {
  embedding: IProductColorEmbedding;
  className?: string;
  /** When false, media is not mounted (saves bandwidth). */
  active?: boolean;
};

const placeholderClass =
  "aspect-video w-full rounded-xl border border-border/60 bg-muted/30";

const unavailableClass =
  "flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-4 text-center text-sm text-muted-foreground";

export default function ProductEmbeddingRenderer({
  embedding,
  className,
  active = true,
}: ProductEmbeddingRendererProps) {
  const [videoError, setVideoError] = React.useState(false);

  if (!active) {
    return <div className={cn(placeholderClass, className)} aria-hidden />;
  }

  if (embedding.kind === "video") {
    const src = buildEmbeddingStreamSrc(
      embedding.stream_path,
      embedding.cache_version,
    );
    if (!src || videoError) {
      return (
        <div className={cn(unavailableClass, className)}>Video unavailable</div>
      );
    }
    return (
      <video
        key={embedding.id}
        controls
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        className={cn(
          "aspect-video w-full rounded-xl border border-border/60 bg-black object-contain",
          className,
        )}
        onError={() => setVideoError(true)}
      >
        <source src={src} type={embedding.content_type ?? "video/mp4"} />
      </video>
    );
  }

  const iframeSrc = embedding.iframe_src;
  if (!iframeSrc) {
    return (
      <div className={cn(unavailableClass, className)}>Embed unavailable</div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-muted/20",
        className,
      )}
    >
      <iframe
        src={iframeSrc}
        title={`Embedded media ${embedding.embed_provider ?? ""}`.trim()}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
      />
    </div>
  );
}
