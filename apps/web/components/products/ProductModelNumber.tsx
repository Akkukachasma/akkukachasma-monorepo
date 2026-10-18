"use client";

import useQueryState from "@/hooks/use-query-state";
import useProductColor from "@/lib/hooks/useProductColor";
import { IProductColor } from "@/lib/types";

interface ProductModelNumberProps {
  product_colors: Array<IProductColor>;
}

/**
  This component works when product color is set in query
*/
const ProductModelNumber: React.FC<ProductModelNumberProps> = ({
  product_colors,
}) => {
  const { value: colorName, setValue: setColorName } =
    useQueryState<string>("color_name");
  const product_color = useProductColor({
    product_colors,
    colorName,
  });
  return <span>{product_color?.model_number}</span>;
};
export default ProductModelNumber;
