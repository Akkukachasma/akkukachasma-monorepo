import React from "react";
import PageWrapper from "@/components/wrappers/PageWrapper";
import Header from "@/components/products/details/header";
import ProductInfo from "@/components/products/details/ProductInfo";
import ProductColorImages from "@/components/products/details/product-color-images";

export type ProductDetailsParams = {
  product_id: string;
};

interface DetailsPageProps {
  params: Promise<ProductDetailsParams>;
}

async function DetailsPage({ params }: DetailsPageProps) {
  const { product_id } = await params;
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header />
      <PageWrapper>
        <ProductInfo product_id={product_id} />
        <ProductColorImages product_id={product_id} />
      </PageWrapper>
    </div>
  );
}

export default DetailsPage;
