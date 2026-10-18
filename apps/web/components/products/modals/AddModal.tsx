"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { showModal } from "@/store/products/form.slice";
import ItemForm from "../ItemForm";

const AddModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((store) => store.productStore.formStore.modal);

  return (
    <Modal
      showCloseIcon
      open={modal}
      onOpenChange={(val) => dispatch(showModal(val))}
      className="max-w-[45rem]"
    >
      <DialogHeader>
        <DialogTitle>Add Product</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new product.
        </DialogDescription>
      </DialogHeader>
      <ItemForm />
    </Modal>
  );
};
export default AddModal;
