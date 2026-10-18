"use client";
import useFetch from "@/lib/hooks/use-fetch";
import React from "react";
import { IProduct } from "../ListItem";
import ENDPOINTS from "@/lib/endpoints";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircleIcon } from "lucide-react";
interface ProductInfoProps {
  product_id: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product_id }) => {
  const { data, isLoading } = useFetch<IProduct>({
    endpoint: ENDPOINTS.admin.products.fetch_single(product_id),
  });

  if (isLoading || !data) {
    return (
      <div className="flex flex-row gap-6">
        <Skeleton className="size-40" />
        <div className="flex flex-col gap-1">
          <Skeleton className="w-64" />
          <Skeleton className="w-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center flex-wrap gap-4">
      <ProductDetail
        label="Slug"
        helpText="We will remove this field once all products are updated as par new structure."
        value={data?.slug || "N/A"}
      />
      <ProductDetail
        label="Model Number"
        helpText="We will remove this field once all products are updated as par new structure."
        value={(data as any)?.model_number || "N/A"}
      />
      <ProductDetail
        label="In Stock"
        helpText="We will remove this field once all products are updated as par new structure."
        value={(data as any)?.stock_quantity || "N/A"}
      />
      <ProductDetail
        label="Listing Price"
        value={data?.listing_price?.toFixed(2) || "N/A"}
      />
      <ProductDetail
        label="Selling Price"
        value={data?.price?.toFixed(2) || "N/A"}
      />
      <ProductDetail
        label="Discount"
        value={data?.discount_percent?.toFixed(2) + "%" || "N/A"}
      />
      <ProductDetail label="Gender" value={data?.gender || "N/A"} />
      <ProductDetail
        label="Lens Width"
        value={data?.lens_width?.toFixed(2) || "N/A"}
      />
      <ProductDetail
        label="Lens Height"
        value={data?.lens_height?.toFixed(2) || "N/A"}
      />
      <ProductDetail
        label="Frame Width"
        value={data?.frame_width?.toFixed(2) || "N/A"}
      />
      <ProductDetail
        label="Raw Material Sourced From"
        value={data?.raw_material_sourced_from || "N/A"}
      />
      <ProductDetail
        label="Lens Material"
        value={data?.lens_material || "N/A"}
      />
      <ProductDetail label="Frame Style" value={data?.frame_style || "N/A"} />
      <ProductDetail label="Frame Size" value={data?.frame_size?.join(", ")} />
      <ProductDetail label="Category" value={data?.category?.title} />
      <ProductDetail label="Shape" value={data?.shape?.title} />
      <ProductDetail
        label="Frame Material"
        value={data?.frame_material?.title || ""}
      />
      <ProductDetail
        label="Power Types"
        value={data?.power_types
          ?.map((powerType) => powerType.title)
          ?.join(", ")}
      />
      <ProductDetail label="Tags" value={data?.tags?.join(", ")} />
    </div>
  );
};

const ProductDetail: React.FC<{
  label: string;
  value: string;
  helpText?: string;
}> = ({ label, value, helpText }) => {
  return (
    <div className="flex flex-col text-xs shadow-subtle hover:shadow-hover animate-smooth p-2 min-w-28 rounded-xl">
      <div className="font-semibold flex items-center gap-2">
        <span>{label}</span>
        {helpText && (
          <span title={helpText}>
            <HelpCircleIcon className="size-3" />
          </span>
        )}
      </div>
      <div className="text-gray-400">{value}</div>
    </div>
  );
};

export default ProductInfo;
