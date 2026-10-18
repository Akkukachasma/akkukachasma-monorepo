"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { showModal } from "@/store/shapes/form.slice";
import ShapeForm from "./ShapeForm";

const AddModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((store) => store.shapeStore.formStore.modal);

  return (
    <Modal
      showCloseIcon
      open={modal}
      onOpenChange={(val) => dispatch(showModal(val))}
      className="max-w-[1000px]"
    >
      <DialogHeader>
        <DialogTitle>Add Shape</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new Shape.
        </DialogDescription>
      </DialogHeader>
      <ShapeForm />
    </Modal>
  );
};
export default AddModal;
