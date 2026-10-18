"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store";
import React from "react";

import { resetStore } from "@/store/shapes/form.slice";
import Form from "./ShapeForm";
import { setItemId } from "@/store/shapes/form.slice";

const EditModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const item_id = useAppSelector((store) => store.shapeStore.formStore.item_id);

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
      className="max-w-[1000px]"
    >
      <DialogHeader>
        <DialogTitle>Update Shape</DialogTitle>
        <DialogDescription>
          Make changes to shape here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <Form />
    </Modal>
  );
};
export default EditModal;
