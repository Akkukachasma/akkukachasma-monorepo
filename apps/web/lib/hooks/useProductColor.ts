import React from "react";
import { IFile, IProductColor } from "../types";
const useProductColor = ({
  product_colors,
  colorName,
}: {
  product_colors: IProductColor[];
  colorName?: string;
}) => {
  const [product_color, setProductColor] = React.useState<IProductColor>();

  React.useEffect(() => {
    if (Array.isArray(product_colors) && product_colors.length) {
      if (colorName) {
        // Parse the colorName string
        const colorParts = colorName.split("-and-").map((part) => {
          const [name, color] = part.split("-");
          return { name, color };
        });

        const match = product_colors.find((product_color) => {
          if (product_color.colors.length !== colorParts.length) return false;

          const remaining = [...colorParts];

          for (let c of product_color.colors) {
            const index = remaining.findIndex(
              (rc) => rc.name === c.name && rc.color === c.color,
            );
            if (index === -1) return false;
            remaining.splice(index, 1); // remove matched one
          }

          return remaining.length === 0;
        });

        setProductColor(match);
      } else {
        setProductColor(product_colors[0]);
      }
    }
  }, [product_colors, colorName]);

  return product_color;
};

export default useProductColor;
