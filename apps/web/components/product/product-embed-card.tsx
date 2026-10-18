"use client";

import * as React from "react";
import type { EmbedProvider, IProductColorEmbedding } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProductEmbedCardProps = {
  embedding: IProductColorEmbedding;
  active?: boolean;
  className?: string;
};

/** Approximate native iframe heights per provider (no forced aspect-ratio box). */
const EMBED_IFRAME_HEIGHT: Record<
  Exclude<EmbedProvider, null> | "default",
  number
> = {
  instagram: 780,
  facebook: 500,
  youtube: 360,
  vimeo: 360,
  unknown: 420,
  default: 420,
};

function iframeHeight(provider: EmbedProvider | null | undefined): number {
  if (
    provider &&
    provider !== "unknown" &&
    provider in EMBED_IFRAME_HEIGHT
  ) {
    return EMBED_IFRAME_HEIGHT[provider];
  }
  if (provider === "unknown") {
    return EMBED_IFRAME_HEIGHT.unknown;
  }
  return EMBED_IFRAME_HEIGHT.default;
}

const unavailableClass =
  "flex min-h-[8rem] w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 text-center text-sm text-muted-foreground";

export default function ProductEmbedCard({
  embedding,
  active = true,
  className,
}: ProductEmbedCardProps) {
  if (!active) {
    return (
      <div
        className={cn("min-h-[8rem] w-full rounded-xl bg-muted/20", className)}
        aria-hidden
      />
    );
  }

  const iframeSrc = embedding.iframe_src;
  if (!iframeSrc) {
    return (
      <div className={cn(unavailableClass, className)}>Embed unavailable</div>
    );
  }

  const label =
    embedding.embed_provider && embedding.embed_provider !== "unknown"
      ? `${embedding.embed_provider} embed`
      : "Embedded media";

  const height = iframeHeight(embedding.embed_provider);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-card/50 shadow-sm",
        className,
      )}
    >
      <iframe
        src={iframeSrc}
        title={label}
        width="100%"
        height={height}
        className="block w-full max-w-full border-0"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
      />
    </article>
  );
}
