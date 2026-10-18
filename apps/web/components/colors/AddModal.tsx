"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { showModal } from "@/store/colors/form.slice";
import ColorForm from "./ColorForm";

const AddModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((store) => store.colorStore.formStore.modal);

  return (
    <Modal
      showCloseIcon
      open={modal}
      onOpenChange={(val) => dispatch(showModal(val))}
    >
      <DialogHeader>
        <DialogTitle>Add color</DialogTitle>
        <DialogDescription>
          Click the color picker to select the color or you can enter the hex
          color code.
        </DialogDescription>
      </DialogHeader>
      <ColorForm />
    </Modal>
  );
};
export default AddModal;
