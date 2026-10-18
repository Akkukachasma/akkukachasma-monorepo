"use client";
import ColorTabs from "./ColorTabs";
import ColorImages from "./ColorImages";
import ProductColorEmbeddingsPanel from "@/features/product-color-embedding/admin/ProductColorEmbeddingsPanel";
import PermissionGuard from "@/components/PermissionGuard";

interface ProductColorImagesProps {
  product_id: string;
}

const ProductColorImages = ({ product_id }: ProductColorImagesProps) => {
  return (
    <div className="flex flex-col py-4 gap-4">
      <ColorTabs product_id={product_id} />
      <ColorImages product_id={product_id} />
      <PermissionGuard permission="product-embedding:manage">
        <ProductColorEmbeddingsPanel product_id={product_id} />
      </PermissionGuard>
    </div>
  );
};

export default ProductColorImages;
