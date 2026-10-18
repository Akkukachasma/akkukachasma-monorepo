"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { showModal } from "@/store/banners/banner-image.slice";
import ItemForm from "./ItemForm";

const AddModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector(
    (store) => store.bannerStore.bannerImageStore.modal,
  );

  return (
    <Modal
      showCloseIcon
      open={modal}
      onOpenChange={(val) => dispatch(showModal(val))}
      className="max-w-[600px]"
    >
      <DialogHeader>
        <DialogTitle>Add Banner Image</DialogTitle>
        <DialogDescription>
          Fill in the details and upload an image to add a new banner image.
        </DialogDescription>
      </DialogHeader>
      <ItemForm />
    </Modal>
  );
};
export default AddModal;
