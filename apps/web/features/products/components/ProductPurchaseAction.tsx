"use client";
import PurchaseFrameOnly from "@/components/products/PurchaseFrameOnly";
import { SelectLens } from "@/features/select-lens";
import BuyOnWhatsapp from "./BuyOnWhatsapp";
import AddToCartFrameOnly from "./AddToCartFrameOnly";
import BuyNow from "./BuyNow";
import { IProduct } from "@/components/products/ListItem";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ProductPurchaseActionProps {
  product: IProduct;
  /** Extra classes for the outer wrapper (e.g. mobile sticky bar layout). */
  className?: string;
  isMobile?: boolean;
}

const ProductPurchaseAction = ({
  product,
  className,
  isMobile,
}: ProductPurchaseActionProps) => {
  const { model_number } = useParams<{ model_number: string }>();
  const productColor = useMemo(() => {
    return product.product_colors.find(
      (color) => String(color.model_number) === String(model_number),
    );
  }, [product, model_number]);

  const hasPowerTypes =
    Array.isArray(product.power_types) && product.power_types.length > 0;

  const mobileRowBtn =
    "min-h-11 flex-1 min-w-0 basis-0 px-3 text-sm sm:text-base";

  const rowClass = cn(
    "flex-shrink-0 gap-2",
    isMobile
      ? "flex w-full flex-row flex-nowrap items-stretch"
      : "flex flex-wrap items-center",
    className,
  );

  if (!productColor?.stock_quantity || productColor?.stock_quantity <= 0) {
    return (
      <div className={cn(rowClass)}>
        <div className="text-destructive text-sm font-medium">Out of stock</div>
      </div>
    );
  }

  if (!hasPowerTypes) {
    return (
      <div className={rowClass}>
        <AddToCartFrameOnly
          product_color_id={productColor.id}
          className={isMobile ? mobileRowBtn : undefined}
        />
        <BuyNow
          product_color_id={productColor.id}
          className={isMobile ? mobileRowBtn : undefined}
        />
        <BuyOnWhatsapp isMobile={isMobile} />
      </div>
    );
  }

  return (
    <div className={rowClass}>
      <PurchaseFrameOnly
        isMobile={isMobile}
        product_color_id={productColor.id}
        className={isMobile ? mobileRowBtn : undefined}
      />
      <SelectLens
        isMobile={isMobile}
        product_colors={product.product_colors}
        product={product}
        triggerClassName={isMobile ? mobileRowBtn : undefined}
      />
      <BuyOnWhatsapp isMobile={isMobile} />
    </div>
  );
};
export default ProductPurchaseAction;