"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store";
import React from "react";


import { resetStore } from "@/store/frame-materials/form.slice";
import FrameMaterialForm from "./FrameMaterialForm";
import { setFrameMaterialsId } from "@/store/frame-materials/form.slice";

const EditFrameMaterialModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const frame_material_id = useAppSelector(
    (store) => store.frameMaterialStore.formStore.frame_material_id,
  );

  return (
    <Modal
      open={Boolean(frame_material_id)}
      onOpenChange={(val) => {
        if (!val) {
          dispatch(resetStore());
        }
        dispatch(setFrameMaterialsId(val ? frame_material_id : ""));
      }}
      showCloseIcon
    >
      <DialogHeader>
        <DialogTitle>Update Frame Material</DialogTitle>
        <DialogDescription>
          Make changes to Frame Material here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <FrameMaterialForm />
    </Modal>
  );
};
export default EditFrameMaterialModal;
