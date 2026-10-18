"use client";
import useSessionStorage from "@/hooks/use-session-storage";
import useFetch from "@/lib/hooks/use-fetch";
import { IProduct } from "../../ListItem";
import ENDPOINTS from "@/lib/endpoints";
import React from "react";
import { cn } from "@/lib/utils";
import UpdateProductColor from "./UpdateProductColor";

interface ColorTabsProps {
  product_id: string;
}

const ColorTabs = ({ product_id }: ColorTabsProps) => {
  const { value: colorId, setValue: setColorId } = useSessionStorage(
    `${product_id}_color_id`,
  );
  const { data, isLoading } = useFetch<IProduct>({
    endpoint: ENDPOINTS.admin.products.fetch_single(product_id),
  });

  React.useEffect(() => {
    if (Array.isArray(data?.product_colors) && data.product_colors.length > 0) {
      setColorId((prev: string | undefined) => {
        if (prev) {
          return prev;
        }
        return data.product_colors[0].id;
      });
    }
  }, [data, setColorId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center flex-wrap gap-2 p-1 h-14 bg-gray-200">
      <div className="flex-grow flex items-center gap-2">
        {data?.product_colors?.map((product_color) => (
          <button
            key={product_color.id}
            onClick={() => setColorId(product_color.id)}
            className={cn(
              "size-10 animate-smooth flex flex-col overflow-hidden rounded-full",
              product_color.id === colorId && "border-2 border-white shadow-xl",
            )}
          >
            {product_color.colors.map((color) => {
              console.log("see this", color.color);
              return (
                <span
                  className="w-full h-full inline-block"
                  style={{ background: color.color }}
                  key={color.id}
                />
              );
            })}
          </button>
        ))}
      </div>
      <UpdateProductColor product_colors={data?.product_colors} />
    </div>
  );
};
export default ColorTabs;
