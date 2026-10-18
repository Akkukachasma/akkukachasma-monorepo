"use client";
import EditIcon from "@/components/icons/EditIcon";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { IProductColor } from "@/lib/types";
import React from "react";
import ProductColor from "./ProductColor";
import PlusIcon from "@/components/icons/PlusIcon";
import { showModal } from "@/store/products/product-color.slice";
import { useAppDispatch } from "@/store";
import ProductColorModal from "./ProductColorModal";

interface UpdateProductColorProps {
  product_colors?: IProductColor[];
}
const UpdateProductColor: React.FC<UpdateProductColorProps> = ({
  product_colors = [],
}) => {
  const [open, setOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  return (
    <React.Fragment>
      <Button onClick={() => setOpen(true)} variant="ghost" size="icon">
        <EditIcon className="h-4 w-4" />
      </Button>
      <Modal open={open} onOpenChange={setOpen}>
        <ProductColorModal />
        <DialogTitle className="flex items-center justify-between border-b pb-4 pr-12">
          <strong>Product Colors</strong>
          <Button
            onClick={() => dispatch(showModal(true))}
            variant="ghost"
            size="icon"
            title="Add New Product Color"
          >
            <PlusIcon />
          </Button>
        </DialogTitle>
        <div className="grid grid-cols-12 gap-4">
          {product_colors.map((pc) => {
            return <ProductColor key={pc.id} data={pc} />;
          })}
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default UpdateProductColor;
