"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { cn } from "@/lib/utils";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export type ProductEmbeddingPlayerProps = {
  src: string;
  playing?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  preload?: "none" | "metadata" | "auto";
  className?: string;
  wrapperClassName?: string;
  onError?: () => void;
  onReady?: () => void;
};

export type ProductEmbeddingPlayerHandle = {
  seekToStart: () => void;
};

const ProductEmbeddingPlayer = React.forwardRef<
  ProductEmbeddingPlayerHandle,
  ProductEmbeddingPlayerProps
>(function ProductEmbeddingPlayer(
  {
    src,
    playing = false,
    muted = true,
    loop = false,
    controls = false,
    preload = "metadata",
    className,
    wrapperClassName,
    onError,
    onReady,
  },
  ref,
) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useImperativeHandle(ref, () => ({
    seekToStart: () => {
      const el = videoRef.current;
      if (el) {
        el.currentTime = 0;
        el.pause();
      }
    },
  }));

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-black",
        wrapperClassName,
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      <ReactPlayer
        ref={videoRef}
        src={src}
        playing={playing}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        preload={preload}
        crossOrigin="anonymous"
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        width="100%"
        height="100%"
        className={cn("absolute inset-0 h-full w-full [&_video]:object-contain", className)}
        onError={onError}
        onReady={onReady}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
});

export default ProductEmbeddingPlayer;
