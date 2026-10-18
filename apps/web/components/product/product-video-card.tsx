"use client";

import * as React from "react";
import { Play } from "lucide-react";
import type { IProductColorEmbedding } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildEmbeddingStreamSrc } from "@/features/product-color-embedding/lib/build-embedding-stream-src";
import ProductEmbeddingPlayer, {
  type ProductEmbeddingPlayerHandle,
} from "./product-embedding-player";
import ProductVideoDialog from "./product-video-dialog";

type ProductVideoCardProps = {
  embedding: IProductColorEmbedding;
  className?: string;
};

function useLazyVisible() {
  const ref = React.useRef<HTMLButtonElement>(null);
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
      { rootMargin: "100px", threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible };
}

function useHoverCapable() {
  const [hoverCapable, setHoverCapable] = React.useState(false);
  React.useEffect(() => {
    setHoverCapable(
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    );
  }, []);
  return hoverCapable;
}

function ProductVideoCard({ embedding, className }: ProductVideoCardProps) {
  const { ref, visible } = useLazyVisible();
  const hoverCapable = useHoverCapable();
  const playerRef = React.useRef<ProductEmbeddingPlayerHandle>(null);

  const [hovering, setHovering] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const src = React.useMemo(
    () =>
      buildEmbeddingStreamSrc(
        embedding.stream_path,
        embedding.cache_version,
      ),
    [embedding.stream_path, embedding.cache_version],
  );

  const previewPlaying = hoverCapable && hovering && !dialogOpen && visible;

  const handlePointerLeave = () => {
    setHovering(false);
    playerRef.current?.seekToStart();
  };

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground",
          className,
        )}
      >
        Video unavailable
      </div>
    );
  }

  return (
    <>
      <button
        ref={ref}
        type="button"
        className={cn(
          "group relative w-full overflow-hidden rounded-2xl border border-border/70 bg-black text-left shadow-md transition-[transform,box-shadow] duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "hover:shadow-lg hover:shadow-black/10",
          hoverCapable && "md:hover:scale-[1.01]",
          className,
        )}
        aria-label="Play product video"
        onClick={() => setDialogOpen(true)}
        onMouseEnter={() => hoverCapable && setHovering(true)}
        onMouseLeave={handlePointerLeave}
        onFocus={() => hoverCapable && setHovering(true)}
        onBlur={handlePointerLeave}
      >
        <div className="relative aspect-video w-full">
          {!visible ? (
            <div className="absolute inset-0 bg-muted/40" aria-hidden />
          ) : (
            <ProductEmbeddingPlayer
              ref={playerRef}
              src={src}
              playing={previewPlaying}
              muted
              loop
              controls={false}
              preload="metadata"
              wrapperClassName="!aspect-auto absolute inset-0 h-full w-full"
              onError={() => setFailed(true)}
            />
          )}

          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent transition-opacity duration-300",
              previewPlaying ? "opacity-40" : "opacity-100",
            )}
          />

          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300",
              previewPlaying ? "opacity-0" : "opacity-100",
            )}
          >
            <span className="flex size-14 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
              <Play className="ml-0.5 size-7 fill-current" aria-hidden />
            </span>
          </div>

          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            {hoverCapable ? "Click to expand" : "Tap to expand"}
          </span>
        </div>
      </button>

      <ProductVideoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        src={src}
      />
    </>
  );
}

export default React.memo(ProductVideoCard);
