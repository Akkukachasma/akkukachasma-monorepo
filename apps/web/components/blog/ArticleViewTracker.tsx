"use client";

import { getApiClient } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useEffect } from "react";

const storageKey = (slug: string) => `article_view:${slug}`;

/**
 * Records one view per browser session per slug (sessionStorage; survives React Strict Mode remount).
 */
export default function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug || typeof window === "undefined") return;
    const key = storageKey(slug);
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "pending");
    const api = getApiClient();
    api
      .patch(ENDPOINTS.blog.increment_views(slug))
      .then(() => {
        sessionStorage.setItem(key, "1");
      })
      .catch(() => {
        sessionStorage.removeItem(key);
      });
  }, [slug]);

  return null;
}
