"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store";
import React from "react";

import { resetStore } from "@/store/brands/form.slice";
import Form from "./BrandForm";
import { setItemId } from "@/store/brands/form.slice";

const EditModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const item_id = useAppSelector((store) => store.brandStore.formStore.item_id);

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
        <DialogTitle>Update Brand</DialogTitle>
        <DialogDescription>
          Make changes to brand here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <Form />
    </Modal>
  );
};
export default EditModal;
