import type { MetadataRoute } from "next";

export const SITEMAP_PAGE_SIZE = 200;

const DEFAULT_SITE_ORIGIN = "https://akkukachasma.com";

export function getSiteOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) return DEFAULT_SITE_ORIGIN;
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteOrigin()}${normalized}`;
}

type StaticRouteConfig = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

export const STATIC_ROUTES: StaticRouteConfig[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.5 },
  { path: "/support", changeFrequency: "monthly", priority: 0.5 },
  { path: "/try-at-home", changeFrequency: "monthly", priority: 0.5 },
  { path: "/franchise-enquiry", changeFrequency: "monthly", priority: 0.5 },
  { path: "/track-order", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/login", changeFrequency: "monthly", priority: 0.4 },
  { path: "/signup", changeFrequency: "monthly", priority: 0.4 },
  { path: "/forgot-password", changeFrequency: "monthly", priority: 0.4 },
  { path: "/verify-email", changeFrequency: "monthly", priority: 0.4 },
  { path: "/reset-password", changeFrequency: "monthly", priority: 0.4 },
];

export function staticSitemapEntries(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
  }));
}
