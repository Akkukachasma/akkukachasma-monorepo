"use client";

import { motion } from "framer-motion";
import { ROUTE_LOADER_CONFIG } from "./config";

interface RouteProgressBarProps {
  /** 0–100; when null, bar is hidden. */
  progress: number | null;
}

/**
 * Optional top progress indicator. Wire progress from navigation events when
 * ROUTE_LOADER_CONFIG.enableProgressBar is true.
 */
export function RouteProgressBar({ progress }: RouteProgressBarProps) {
  if (!ROUTE_LOADER_CONFIG.enableProgressBar || progress === null) {
    return null;
  }

  return (
    <motion.div
      className="fixed left-0 top-0 bg-primary"
      style={{
        zIndex: ROUTE_LOADER_CONFIG.zIndex + 1,
        height: ROUTE_LOADER_CONFIG.progressBarHeight,
      }}
      initial={{ width: "0%" }}
      animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      aria-hidden
    />
  );
}
