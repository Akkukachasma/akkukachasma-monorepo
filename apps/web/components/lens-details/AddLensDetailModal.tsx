"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import LensDetailForm from "./LensDetailForm";
import { showModal } from "@/store/lens-details/form.slice";

const AddLensDetailModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector(
    (store) => store.lensDetailStore.formStore.modal,
  );

  return (
    <Modal
      showCloseIcon
      open={modal}
      onOpenChange={(val) => dispatch(showModal(val))}
      className="max-w-[700px]"
    >
      <DialogHeader>
        <DialogTitle>Add Lens Detail</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new lens detail.
        </DialogDescription>
      </DialogHeader>
      <LensDetailForm />
    </Modal>
  );
};
export default AddLensDetailModal;
