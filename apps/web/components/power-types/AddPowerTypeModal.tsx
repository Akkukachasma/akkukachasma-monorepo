"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import PowerTypeForm from "./PowerTypeForm";
import { showModal } from "@/store/power-types/form.slice";

const AddPowerTypeModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((store) => store.powerTypeStore.formStore.modal);

  return (
    <Modal
      showCloseIcon
      open={modal}
      onOpenChange={(val) => dispatch(showModal(val))}
    >
      <DialogHeader>
        <DialogTitle>Add Power Type</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new power type.
        </DialogDescription>
      </DialogHeader>
      <PowerTypeForm />
    </Modal>
  );
};

export default AddPowerTypeModal;
