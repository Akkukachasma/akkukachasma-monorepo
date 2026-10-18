"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ROUTE_LOADER_CONFIG } from "./config";
import { LoaderOverlay } from "./loader-overlay";
import { RouteProgressBar } from "./route-progress-bar";
import {
  RouteLoaderContext,
  type RouteLoaderContextValue,
} from "./route-loader-context";
import {
  buildRouteKey,
  buildRouteKeyFromWindow,
  isInternalNavigationAnchor,
  isSameRouteHref,
  scheduleAfterMinVisible,
  type LoaderPhase,
} from "./transition-manager";

interface RouteLoaderProviderInnerProps {
  children: ReactNode;
}

function RouteLoaderProviderInner({ children }: RouteLoaderProviderInnerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = buildRouteKey(pathname, searchParams);

  const [phase, setPhase] = useState<LoaderPhase>("idle");
  const [progress, setProgress] = useState<number | null>(null);

  const routeKeyRef = useRef(routeKey);
  const phaseRef = useRef<LoaderPhase>("idle");
  const navigationIdRef = useRef(0);
  const startedAtRef = useRef(0);
  const completeTimerRef = useRef<(() => void) | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);
  const startNavigationRef = useRef<() => void>(() => undefined);
  const completeNavigationRef = useRef<() => void>(() => undefined);

  const setPhaseSafe = useCallback((next: LoaderPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearTimers = useCallback(() => {
    completeTimerRef.current?.();
    completeTimerRef.current = null;
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const finishNavigation = useCallback(
    (navigationId: number) => {
      if (navigationId !== navigationIdRef.current) return;

      clearTimers();

      setPhaseSafe("exiting");
      if (ROUTE_LOADER_CONFIG.enableProgressBar) {
        setProgress(100);
      }

      const exitMs = Math.ceil(
        ROUTE_LOADER_CONFIG.overlayFadeOutDuration * 1000,
      );

      exitTimerRef.current = setTimeout(() => {
        if (navigationId !== navigationIdRef.current) return;
        setPhaseSafe("idle");
        if (ROUTE_LOADER_CONFIG.enableProgressBar) {
          setProgress(null);
        }
      }, exitMs);
    },
    [clearTimers, setPhaseSafe],
  );

  const startNavigation = useCallback(() => {
    clearTimers();
    navigationIdRef.current += 1;
    const navigationId = navigationIdRef.current;
    startedAtRef.current = Date.now();

    setPhaseSafe("entering");
    requestAnimationFrame(() => {
      if (navigationId !== navigationIdRef.current) return;
      setPhaseSafe("visible");
    });

    if (ROUTE_LOADER_CONFIG.enableProgressBar) {
      setProgress(12);
    }

    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
    }
    safetyTimerRef.current = setTimeout(() => {
      if (phaseRef.current === "idle") return;
      finishNavigation(navigationIdRef.current);
    }, ROUTE_LOADER_CONFIG.maxNavigationMs);
  }, [clearTimers, setPhaseSafe, finishNavigation]);

  const completeNavigation = useCallback(() => {
    const navigationId = navigationIdRef.current;
    if (phaseRef.current === "idle") return;

    clearTimers();
    completeTimerRef.current = scheduleAfterMinVisible(
      startedAtRef.current,
      () => finishNavigation(navigationId),
    );
  }, [clearTimers, finishNavigation]);

  startNavigationRef.current = startNavigation;
  completeNavigationRef.current = completeNavigation;

  // Intercept internal link clicks to show loader before route commit.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest("a");
      if (!anchor || !isInternalNavigationAnchor(anchor)) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (
        isSameRouteHref(href, routeKeyRef.current, window.location.origin)
      ) {
        return;
      }

      startNavigation();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [startNavigation]);

  // Browser back/forward — URL updates before React; avoid restarting an in-flight transition.
  useEffect(() => {
    const handlePopState = () => {
      const nextKey = buildRouteKeyFromWindow();
      if (nextKey === routeKeyRef.current) {
        if (phaseRef.current !== "idle") {
          completeNavigationRef.current();
        }
        return;
      }
      startNavigationRef.current();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // BFCache restore can leave the overlay visible from a previous session.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      clearTimers();
      navigationIdRef.current += 1;
      setPhaseSafe("idle");
      if (ROUTE_LOADER_CONFIG.enableProgressBar) {
        setProgress(null);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [clearTimers, setPhaseSafe]);

  // Route key changed — navigation committed (Link, router.push, or popstate).
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      routeKeyRef.current = routeKey;
      return;
    }

    if (routeKeyRef.current === routeKey) return;

    routeKeyRef.current = routeKey;

    if (phaseRef.current === "idle") {
      startNavigation();
    }

    completeNavigation();
  }, [routeKey, startNavigation, completeNavigation]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const isActive = phase !== "idle";

  const contextValue: RouteLoaderContextValue = {
    phase,
    isActive,
    startNavigation,
  };

  return (
    <RouteLoaderContext.Provider value={contextValue}>
      <LoaderOverlay phase={phase} />
      <RouteProgressBar progress={progress} />
      <div
        className={cn(
          "min-h-full transition-opacity duration-200",
          ROUTE_LOADER_CONFIG.enablePageFade &&
            isActive &&
            phase !== "exiting" &&
            "pointer-events-none opacity-[0.97]",
        )}
      >
        {ROUTE_LOADER_CONFIG.enablePageFade ? (
          <motion.div
            key={routeKey}
            initial={false}
            animate={{ opacity: isActive && phase !== "exiting" ? 0.92 : 1 }}
            transition={{
              duration: ROUTE_LOADER_CONFIG.pageFadeDuration,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
      </div>
    </RouteLoaderContext.Provider>
  );
}

interface RouteLoaderProviderProps {
  children: ReactNode;
}

/**
 * Global route transition loader for Next.js App Router.
 *
 * Detection strategy:
 * 1. Capture internal <a> clicks (capture phase) → show overlay immediately.
 * 2. Listen to popstate for back/forward.
 * 3. usePathname + useSearchParams → detect committed navigation; enforce min visible duration.
 * 4. Programmatic router.push without prior click still triggers via route key change.
 */
export function RouteLoaderProvider({ children }: RouteLoaderProviderProps) {
  return (
    <Suspense fallback={children}>
      <RouteLoaderProviderInner>{children}</RouteLoaderProviderInner>
    </Suspense>
  );
}
