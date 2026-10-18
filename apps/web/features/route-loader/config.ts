/**
 * Central branding and timing configuration for the global route loader.
 * Adjust these values to customize motion without touching component logic.
 */
export const ROUTE_LOADER_CONFIG = {
  /** Minimum time the overlay stays visible (prevents flicker on fast navigations). */
  minVisibleMs: 500,

  /** Force-hide overlay if navigation never completes (e.g. back-button race). */
  maxNavigationMs: 10_000,

  /** Overlay backdrop + logo motion durations (seconds, Framer Motion). */
  overlayFadeInDuration: 0.28,
  overlayFadeOutDuration: 0.38,
  logoFadeInDuration: 0.32,
  logoFadeOutDuration: 0.28,
  logoPulseScale: 1.04,

  /** Logo asset (public path). */
  logoSrc: "/Logo.png",
  logoAlt: "Akku Ka Chasma",

  /** Subtle glow behind the logo. */
  glowEnabled: true,

  /** Fade page content while transitioning (optional enhancement). */
  enablePageFade: true,
  pageFadeDuration: 0.25,

  /**
   * Top progress bar architecture — disabled by default.
   * Set to true and implement RouteProgressBar when needed.
   */
  enableProgressBar: false,
  progressBarHeight: 2,

  /** z-index for the fullscreen overlay. */
  zIndex: 9999,
} as const;

export type RouteLoaderConfig = typeof ROUTE_LOADER_CONFIG;
