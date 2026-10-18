"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store";
import React from "react";

import { resetStore } from "@/store/categories/form.slice";
import Form from "./CategoryForm";
import { setItemId } from "@/store/categories/form.slice";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const EditModal: React.FC = () => {
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("category_image");
  const dispatch = useAppDispatch();
  const item_id = useAppSelector(
    (store) => store.categoryStore.formStore.item_id,
  );

  const handleClose = (val: boolean) => {
    if (!val) {
      dispatch(resetStore());
      if (uploadedImage) removeUploadedImageFromSession();
    }
    dispatch(setItemId(val ? item_id : ""));
  };

  return (
    <Modal
      open={Boolean(item_id)}
      onOpenChange={(val) => handleClose(val)}
      showCloseIcon
      className="max-w-[1000px]"
    >
      <DialogHeader>
        <DialogTitle>Update Category</DialogTitle>
        <DialogDescription>
          Make changes to shape here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <Form />
    </Modal>
  );
};
export default EditModal;
