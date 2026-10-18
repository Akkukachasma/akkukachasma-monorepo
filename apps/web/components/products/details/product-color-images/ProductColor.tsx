"use client";
import EditIcon from "@/components/icons/EditIcon";
import { Button } from "@/components/ui/button";
import { IProductColor } from "@/lib/types";
import { useAppDispatch } from "@/store";
import {
  setData,
  setItemToDelete,
  showModal,
} from "@/store/products/product-color.slice";
import { TrashIcon } from "lucide-react";
import React from "react";
import DeleteProductColorModal from "./DeleteProductColorModal";
interface ProductColorProps {
  data: IProductColor;
}
const ProductColor: React.FC<ProductColorProps> = ({ data }) => {
  const dispatch = useAppDispatch();
  const handleEdit = () => {
    dispatch(showModal(true));
    dispatch(setData(data));
  };
  return (
    <React.Fragment>
      <DeleteProductColorModal />
      <div className="border rounded-2xl overflow-hidden p-4 relative group col-span-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-32 flex-shrink-0 font-medium">Model Number :</div>
          <div>{data.model_number}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 flex-shrink-0 font-medium">In Stock :</div>
          <div>{data.stock_quantity || 0}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 flex-shrink-0 font-medium">Total Images :</div>
          <div>{data.images?.length}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 flex-shrink-0 font-medium">Colors :</div>
          <div className="flex items-center gap-1">
            {data.colors?.map((c) => (
              <span
                key={c.id}
                className="inline-block size-4 rounded-full"
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        </div>
        <div className="hidden group-hover:flex absolute inset-0 items-center justify-center bg-black/50 gap-2">
          <Button variant="secondary" size="icon" onClick={() => handleEdit()}>
            <EditIcon className="size-4" />
          </Button>
          <Button
            onClick={() =>
              dispatch(
                setItemToDelete({
                  id: data.id || "",
                  label: data.colors?.map((c) => c.name).join(" and "),
                }),
              )
            }
            variant="destructive"
            size="icon"
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ProductColor;
