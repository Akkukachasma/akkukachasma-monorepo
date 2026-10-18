"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import TryAtHomePurposeForm from "./TryAtHomePurposeForm";
import { showModal } from "@/features/tryathome/store";

const AddTryAtHomePurposeModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.tryathomePurposes.modal.modal);
  const purposeToEdit = useAppSelector(
    (state) => state.tryathomePurposes.modal.purposeToEdit,
  );

  return (
    <Modal
      showCloseIcon
      open={modal}
      onOpenChange={(val) => dispatch(showModal(val))}
    >
      <DialogHeader>
        <DialogTitle>
          {purposeToEdit ? "Edit Purpose" : "Add Purpose"}
        </DialogTitle>
        <DialogDescription>
          {purposeToEdit
            ? "Update the purpose label below."
            : "Fill in the details to add a new try at home purpose."}
        </DialogDescription>
      </DialogHeader>
      <TryAtHomePurposeForm />
    </Modal>
  );
};

export default AddTryAtHomePurposeModal;
