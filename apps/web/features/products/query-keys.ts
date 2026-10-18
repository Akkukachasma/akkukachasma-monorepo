export const PRODUCT_QUERY_KEYS = {
  relatedBanners: (categoryId?: string, shapeId?: string) =>
    ["products", "related-banners", categoryId, shapeId] as const,
  relatedShapeProducts: (shapeSlug?: string, excludeProductColorId?: string) =>
    [
      "products",
      "related-shape-products",
      shapeSlug,
      excludeProductColorId,
    ] as const,
} as const;
