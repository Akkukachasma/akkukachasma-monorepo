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
import useDeleteFrameMaterials from "@/lib/mutations/admin/frame-materials/useDeleteFrameMaterials";
import { setFrameMaterialToDelete } from "@/store/frame-materials/data.slice";

const DeleteFrameMaterialModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mutate: deleteFrameMaterial, isPending } = useDeleteFrameMaterials();

  // Accessing delete_modal from store
  const frameMaterialToDelete = useAppSelector(
    (store) => store.frameMaterialStore.dataStore.frameMaterialToDelete,
  );

  return (
    <Modal
      showCloseIcon
      open={Boolean(frameMaterialToDelete)}
      onOpenChange={(val) =>
        dispatch(setFrameMaterialToDelete(val ? frameMaterialToDelete : null))
      }
    >
      <DialogHeader>
        <DialogTitle>Delete Frame Material</DialogTitle>
        {/* Changed title to match delete purpose */}
        <DialogDescription>
          Are you sure you want to delete &nbsp;
          <strong className="text-primary">
            {capitalizeFirstLetter(frameMaterialToDelete?.label)}
          </strong>
          ? This action cannot be undone.
        </DialogDescription>
        {/* Updated description to reflect delete action */}
      </DialogHeader>
      <DialogFooter>
        <Button variant="destructive" onClick={() => deleteFrameMaterial()}>
          <ProcessIndicator isProcessing={isPending} btnText="Confirm Delete" />
        </Button>
        <Button onClick={() => dispatch(setFrameMaterialToDelete(null))}>
          Cancel
        </Button>
      </DialogFooter>
    </Modal>
  );
};

export default DeleteFrameMaterialModal;
