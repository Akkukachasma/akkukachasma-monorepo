"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store";
import React from "react";

import { resetStore } from "@/store/banners/banner-image.slice";
import Form from "./ItemForm";
import { setData } from "@/store/banners/banner-image.slice";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const EditModal: React.FC = () => {
  const { removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("banner_image");
  const dispatch = useAppDispatch();
  const data = useAppSelector(
    (store) => store.bannerStore.bannerImageStore.data,
  );

  const handleClose = (val: boolean) => {
    if (!val) {
      dispatch(resetStore());
      removeUploadedImageFromSession();
    }
    dispatch(setData(val ? data : null));
  };

  return (
    <Modal
      open={Boolean(data)}
      onOpenChange={(val) => handleClose(val)}
      showCloseIcon
      className="max-w-[600px]"
    >
      <DialogHeader>
        <DialogTitle>Update Banner Image</DialogTitle>
        <DialogDescription>
          Make changes to banner image here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <Form />
    </Modal>
  );
};
export default EditModal;
