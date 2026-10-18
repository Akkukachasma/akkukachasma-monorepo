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
import { setPurposeToDelete } from "@/features/tryathome/store";
import useDeleteTryAtHomePurpose from "../mutations/useDeleteTryAtHomePurpose";

const DeleteTryAtHomePurposeModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mutate: deletePurpose, isPending } = useDeleteTryAtHomePurpose();

  const purposeToDelete = useAppSelector(
    (store) => store.tryathomePurposes.modal.purposeToDelete,
  );

  const handleDelete = () => {
    if (purposeToDelete) {
      deletePurpose(purposeToDelete.id);
    }
  };

  return (
    <Modal
      showCloseIcon
      open={Boolean(purposeToDelete)}
      onOpenChange={(val) =>
        dispatch(setPurposeToDelete(val ? purposeToDelete : null))
      }
    >
      <DialogHeader>
        <DialogTitle>Delete Purpose</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete &nbsp;
          <strong className="text-primary">
            {capitalizeFirstLetter(purposeToDelete?.label)}
          </strong>
          ? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="destructive" onClick={handleDelete}>
          <ProcessIndicator isProcessing={isPending} btnText="Confirm Delete" />
        </Button>
        <Button onClick={() => dispatch(setPurposeToDelete(null))}>
          Cancel
        </Button>
      </DialogFooter>
    </Modal>
  );
};

export default DeleteTryAtHomePurposeModal;
