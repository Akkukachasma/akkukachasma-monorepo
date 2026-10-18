import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/sitemap/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/manage/",
        "/customers/",
        "/cart",
        "/checkout/",
        "/wishlist",
      ],
    },
    sitemap: `${getSiteOrigin()}/sitemap.xml`,
  };
}
