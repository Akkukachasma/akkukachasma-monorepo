"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { showModal } from "@/store/brands/form.slice";
import BrandForm from "./BrandForm";

const AddModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((store) => store.brandStore.formStore.modal);

  return (
    <Modal
      showCloseIcon
      open={modal}
      onOpenChange={(val) => dispatch(showModal(val))}
    >
      <DialogHeader>
        <DialogTitle>Add Brand</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new brand.
        </DialogDescription>
      </DialogHeader>
      <BrandForm />
    </Modal>
  );
};
export default AddModal;
