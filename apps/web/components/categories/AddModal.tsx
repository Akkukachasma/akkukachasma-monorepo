"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { showModal } from "@/store/categories/form.slice";
import CategoryForm from "./CategoryForm";

const AddModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((store) => store.categoryStore.formStore.modal);

  return (
    <Modal
      showCloseIcon
      open={modal}
      onOpenChange={(val) => dispatch(showModal(val))}
      className="max-w-[1000px]"
    >
      <DialogHeader>
        <DialogTitle>Add Category</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new category.
        </DialogDescription>
      </DialogHeader>
      <CategoryForm />
    </Modal>
  );
};
export default AddModal;
