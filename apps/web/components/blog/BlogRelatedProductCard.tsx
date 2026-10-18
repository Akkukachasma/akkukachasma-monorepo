"use client";

import React from "react";
import ProductCard1, {
  type ProductCardProps,
} from "@/features/products/components/cards/ProductCard1";

/** Related-product slide for blog details — shorter cards on small screens. */
const BlogRelatedProductCard = React.forwardRef<
  HTMLDivElement,
  ProductCardProps
>(function BlogRelatedProductCard(props, ref) {
  return (
    <ProductCard1
      ref={ref}
      {...props}
      imageHeight={240}
      className="max-w-none"
    />
  );
});

export default BlogRelatedProductCard;
