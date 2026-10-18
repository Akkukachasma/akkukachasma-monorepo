"use client";

import { useEffect, useRef } from "react";
import { recordProductView, type RecordProductViewPayload } from "../api/popularity.api";

/**
 * Fires a single view event when the PDP mounts (variant-aware when payload is set).
 */
export function useProductViewEffect(
  slug: string | undefined,
  payload?: RecordProductViewPayload,
) {
  const fired = useRef(false);

  useEffect(() => {
    if (!slug || fired.current) return;
    fired.current = true;
    void recordProductView(slug, payload).catch(() => {
      /* non-blocking analytics */
    });
  }, [slug, payload?.product_color_id, payload?.model_number]);
}
