"use client";
import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store";
import { setData, showModal } from "@/store/products/product-color.slice";
import React from "react";
import ProductColorForm from "./ProductColorForm";
import { DialogTitle } from "@/components/ui/dialog";

const ProductColorModal = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector(
    (store) => store.productStore.productColorStore.modal,
  );
  const handleClose = (val: boolean) => {
    dispatch(setData(null));
    dispatch(showModal(val));
  };
  return (
    <Modal open={open} onOpenChange={(val) => handleClose(val)}>
      <DialogTitle>Product Color Form</DialogTitle>
      <ProductColorForm />
    </Modal>
  );
};

export default ProductColorModal;
