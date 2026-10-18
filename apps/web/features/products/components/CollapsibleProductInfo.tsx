"use client";

import { IProduct } from "@/components/products/ListItem";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { frameStyles } from "@/lib/validations/admin/product.validation";
import { ChevronDownIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

const INFO_ROWS = (
  product: IProduct,
  productColor: IProduct["product_colors"][0] | undefined
) => [
    { label: "Shape", value: product?.shape?.title ?? "—" },
    { label: "Gender", value: product?.gender ?? "—" },
    { label: "Model Number", value: productColor?.model_number ?? "—" },
    {
      label: "Color",
      value: productColor?.colors?.map((c) => c.name).join(", ") ?? "—",
    },
    {
      label: "Frame Width",
      value: product?.frame_width != null ? `${product.frame_width} mm` : "—",
    },
    {
      label: "Lens Width",
      value: product?.lens_width != null ? `${product.lens_width} mm` : "—",
    },
    {
      label: "Lens Height",
      value: product?.lens_height != null ? `${product.lens_height} mm` : "—",
    },
    { label: "Frame Style", value: frameStyles.find(style => style.value === product.frame_style)?.label ?? "—" },
    { label: "Frame Material", value: product?.frame_material?.title ?? "—" },
  ];

const CollapsibleProductInfo = ({ product }: { product: IProduct }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { model_number } = useParams<{ model_number: string }>();

  const product_color = useMemo(
    () =>
      product.product_colors?.find(
        (color) => String(color.model_number) === String(model_number),
      ),
    [product, model_number],
  );

  const rows = useMemo(
    () => INFO_ROWS(product, product_color),
    [product, product_color]
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-1 text-left hover:opacity-80">
        <h2 className="text-lg font-semibold tracking-tight">Product Info</h2>
        <ChevronDownIcon
          className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 overflow-hidden rounded-lg border bg-muted/30">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(({ label, value }, i) => (
                <tr
                  key={label}
                  className={cn(
                    "border-border/60",
                    i < rows.length - 1 && "border-b"
                  )}
                >
                  <td className="py-3 pl-4 pr-6 font-medium text-muted-foreground">
                    {label}
                  </td>
                  <td className="py-3 pr-4 text-foreground font-semibold">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleProductInfo;