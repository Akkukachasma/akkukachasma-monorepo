"use client";
import React, { useCallback, useMemo } from "react";
import ColorSwitcher from "./ColorSwitcher";
import { IProductColor } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { getColorName } from "@/lib/hooks/useColorName";

interface PersistedColorSwitcherProps {
  product_colors?: Array<IProductColor>;
  product_slug: string;
  model_number?: string;
  className?: string;
}

const PersistedColorSwitcher: React.FC<PersistedColorSwitcherProps> = ({
  product_colors = [],
  product_slug,
  model_number,
  className = "",
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const colorName = useMemo(() => {
    const fromUrl = searchParams.get("color_name");
    if (fromUrl) return fromUrl;
    if (!Array.isArray(product_colors) || !product_colors.length) return "";
    const matching = model_number
      ? product_colors.find((pc) => String(pc.model_number) === String(model_number))
      : null;
    const pc = matching ?? product_colors[0];
    return getColorName(pc?.colors ?? []);
  }, [searchParams, product_colors, model_number]);

  const getProductColor = useCallback(
    (colorName: string): IProductColor | undefined => {
      if (!Array.isArray(product_colors) || !product_colors.length) return undefined;
      if (colorName) {
        const found = product_colors.find(
          (pc) => getColorName(pc.colors ?? []) === colorName
        );
        if (found) return found;
      }
      return product_colors[0];
    },
    [product_colors]
  );

  const handleChange = useCallback(
    (val: string) => {
      const productColor = getProductColor(val);
      if (!productColor?.model_number) return;
      const searchParams = new URLSearchParams();
      searchParams.set("color_name", val);
      router.push(
        `/${product_slug}/${productColor.model_number}?${searchParams.toString()}`
      );
    },
    [getProductColor, product_slug, router]
  );


  return (
    <div className="p-3 shadow-xl shadow-primary/5 rounded-3xl">
      <ColorSwitcher
        value={colorName}
        onChange={handleChange}
        colors={product_colors?.map((pc) => pc.colors)}
        className={className}
      />
    </div>
  );
};
export default PersistedColorSwitcher;
