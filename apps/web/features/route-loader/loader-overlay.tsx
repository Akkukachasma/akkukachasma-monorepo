"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ROUTE_LOADER_CONFIG } from "./config";
import type { LoaderPhase } from "./transition-manager";

interface LoaderOverlayProps {
  phase: LoaderPhase;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: ROUTE_LOADER_CONFIG.overlayFadeInDuration,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ROUTE_LOADER_CONFIG.overlayFadeOutDuration,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ROUTE_LOADER_CONFIG.logoFadeInDuration,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: ROUTE_LOADER_CONFIG.logoFadeOutDuration,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const pulseVariants = {
  visible: {
    scale: [1, ROUTE_LOADER_CONFIG.logoPulseScale, 1],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

export function LoaderOverlay({ phase }: LoaderOverlayProps) {
  const isVisible = phase !== "idle";

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="route-loader-overlay"
          role="status"
          aria-live="polite"
          aria-busy={phase !== "exiting"}
          aria-label="Loading page"
          className={cn(
            "fixed inset-0 flex items-center justify-center",
            "bg-background/80 backdrop-blur-md",
            "dark:bg-background/90",
          )}
          style={{ zIndex: ROUTE_LOADER_CONFIG.zIndex }}
          variants={overlayVariants}
          initial="hidden"
          animate={phase === "exiting" ? "exit" : "visible"}
          exit="exit"
        >
          <div className="relative flex flex-col items-center justify-center">
            {ROUTE_LOADER_CONFIG.glowEnabled && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute h-40 w-40 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}

            <motion.div
              className="relative h-16 w-44 sm:h-20 sm:w-56"
              variants={logoVariants}
              initial="hidden"
              animate={phase === "exiting" ? "exit" : "visible"}
            >
              <motion.div
                className="relative h-full w-full"
                variants={pulseVariants}
                animate={phase === "exiting" ? undefined : "visible"}
              >
                <Image
                  src={ROUTE_LOADER_CONFIG.logoSrc}
                  alt={ROUTE_LOADER_CONFIG.logoAlt}
                  fill
                  priority
                  className="object-contain dark:invert"
                  sizes="224px"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
