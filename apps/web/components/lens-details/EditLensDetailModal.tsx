"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store";
import React from "react";

import LensDetailForm from "./LensDetailForm";
import { setLensDetailId, resetStore } from "@/store/lens-details/form.slice";

const EditLensDetailModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const lens_detail_id = useAppSelector(
    (store) => store.lensDetailStore.formStore.lens_detail_id,
  );

  return (
    <Modal
      open={Boolean(lens_detail_id)}
      onOpenChange={(val) => {
        if (!val) {
          dispatch(resetStore());
        }
        dispatch(setLensDetailId(val ? lens_detail_id : ""));
      }}
      showCloseIcon
    >
      <DialogHeader>
        <DialogTitle>Update Lens Detail</DialogTitle>
        <DialogDescription>
          Make changes to lens detail here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <LensDetailForm />
    </Modal>
  );
};
export default EditLensDetailModal;
