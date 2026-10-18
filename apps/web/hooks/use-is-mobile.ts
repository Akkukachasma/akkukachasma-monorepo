"use client";

import { useSyncExternalStore } from "react";

const MD_MAX_WIDTH_PX = 767;

function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia(`(max-width: ${MD_MAX_WIDTH_PX}px)`);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMobileSnapshot() {
  return window.matchMedia(`(max-width: ${MD_MAX_WIDTH_PX}px)`).matches;
}

/** Stable mobile breakpoint; avoids width=0 flash from resize hooks. */
export function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    () => false,
  );
}
