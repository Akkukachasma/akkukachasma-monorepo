"use client";
import { Button, ProcessIndicator } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { capitalizeFirstLetter } from "@/lib/utils";
import useDelete from "@/lib/mutations/admin/banners/useDeleteBannerImage";
import { setItemToDelete } from "@/store/banners/banner-image.slice";

const DeleteModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mutate: deleteItem, isPending } = useDelete();

  // Accessing delete_modal from store
  const itemToDelete = useAppSelector(
    (store) => store.bannerStore.bannerImageStore.itemToDelete,
  );

  return (
    <Modal
      showCloseIcon
      open={Boolean(itemToDelete)}
      onOpenChange={(val) =>
        dispatch(setItemToDelete(val ? itemToDelete : null))
      }
    >
      <DialogHeader>
        <DialogTitle>Delete Banner Image</DialogTitle>
        {/* Changed title to match delete purpose */}
        <DialogDescription>
          Are you sure you want to delete? This action cannot be undone.
        </DialogDescription>
        {/* Updated description to reflect delete action */}
      </DialogHeader>
      <DialogFooter>
        <Button variant="destructive" onClick={() => deleteItem()}>
          <ProcessIndicator isProcessing={isPending} btnText="Confirm Delete" />
        </Button>
        <Button onClick={() => dispatch(setItemToDelete(null))}>Cancel</Button>
      </DialogFooter>
    </Modal>
  );
};

export default DeleteModal;
