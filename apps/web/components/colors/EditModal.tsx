"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store";
import React from "react";

import { resetStore } from "@/store/colors/form.slice";
import ColorForm from "./ColorForm";
import { setItemId } from "@/store/colors/form.slice";

const EditModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const item_id = useAppSelector((store) => store.colorStore.formStore.item_id);

  return (
    <Modal
      open={Boolean(item_id)}
      onOpenChange={(val) => {
        if (!val) {
          dispatch(resetStore());
        }
        dispatch(setItemId(val ? item_id : ""));
      }}
      showCloseIcon
    >
      <DialogHeader>
        <DialogTitle>Update Color</DialogTitle>
        <DialogDescription>
          Click the color picker to select the color or you can enter the hex
          color code.. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <ColorForm />
    </Modal>
  );
};
export default EditModal;
