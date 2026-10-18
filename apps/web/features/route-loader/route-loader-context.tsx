"use client";

import { createContext, useContext } from "react";
import type { LoaderPhase } from "./transition-manager";

export interface RouteLoaderContextValue {
  phase: LoaderPhase;
  isActive: boolean;
  /** Manually trigger the loader (e.g. before router.push). */
  startNavigation: () => void;
}

export const RouteLoaderContext = createContext<RouteLoaderContextValue | null>(
  null,
);

export function useRouteLoader(): RouteLoaderContextValue {
  const ctx = useContext(RouteLoaderContext);
  if (!ctx) {
    throw new Error("useRouteLoader must be used within RouteLoaderProvider");
  }
  return ctx;
}

/** Safe variant when provider is optional (e.g. Storybook). */
export function useRouteLoaderOptional(): RouteLoaderContextValue | null {
  return useContext(RouteLoaderContext);
}
