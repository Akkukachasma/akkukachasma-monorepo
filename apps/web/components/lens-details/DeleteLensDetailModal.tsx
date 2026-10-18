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
import { setLensDetailToDelete } from "@/store/lens-details/data.slice";
import useDeleteLensDetail from "@/lib/mutations/admin/lens-details/useDeleteLensDetail";

const DeleteLensDetailModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mutate: deleteLensDetail, isPending } = useDeleteLensDetail();

  // Accessing delete_modal from store
  const lensDetailToDelete = useAppSelector(
    (store) => store.lensDetailStore.dataStore.lensDetailToDelete,
  );

  return (
    <Modal
      showCloseIcon
      open={Boolean(lensDetailToDelete)}
      onOpenChange={(val) =>
        dispatch(setLensDetailToDelete(val ? lensDetailToDelete : null))
      }
    >
      <DialogHeader>
        <DialogTitle>Delete Lens Detail</DialogTitle>
        {/* Changed title to match delete purpose */}
        <DialogDescription>
          Are you sure you want to delete &nbsp;
          <strong className="text-primary">
            {capitalizeFirstLetter(lensDetailToDelete?.label)}
          </strong>
          ? This action cannot be undone.
        </DialogDescription>
        {/* Updated description to reflect delete action */}
      </DialogHeader>
      <DialogFooter>
        <Button variant="destructive" onClick={() => deleteLensDetail()}>
          <ProcessIndicator isProcessing={isPending} btnText="Confirm Delete" />
        </Button>
        <Button onClick={() => dispatch(setLensDetailToDelete(null))}>
          Cancel
        </Button>
      </DialogFooter>
    </Modal>
  );
};

export default DeleteLensDetailModal;
