"use client";
import React from "react";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store";
import { setData } from "@/store/products/form.slice";
import ItemForm from "../ItemForm";

const EditModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector((store) => store.productStore.formStore.data);

  return (
    <Modal
      showCloseIcon
      open={Boolean(data)}
      onOpenChange={(val) => dispatch(setData(val ? data : null))}
      className="max-w-[45rem]"
    >
      <DialogHeader>
        <DialogTitle>Edit Product Details</DialogTitle>
        <DialogDescription>
          Make changes to product here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <ItemForm />
    </Modal>
  );
};

export default EditModal;
