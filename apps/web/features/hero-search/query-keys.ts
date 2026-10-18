export const HERO_SEARCH_QUERY_KEYS = {
  searchSuggestions: (q: string) =>
    ["hero-search", "suggestions", q] as const,
  categories: ["hero-search", "categories"] as const,
  shapes: ["hero-search", "shapes"] as const,
} as const;
