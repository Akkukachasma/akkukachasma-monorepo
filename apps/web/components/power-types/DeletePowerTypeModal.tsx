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
import { setPowerTypeToDelete } from "@/store/power-types/data.slice";
import useDeletePowerType from "@/lib/mutations/admin/power-types/useDeletePowerType";
import { capitalizeFirstLetter } from "@/lib/utils";

const DeletePowerTypeModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mutate: deletePowerType, isPending } = useDeletePowerType();

  // Accessing delete_modal from store
  const powerTypeToDelete = useAppSelector(
    (store) => store.powerTypeStore.dataStore.powerTypeToDelete,
  );

  return (
    <Modal
      showCloseIcon
      open={Boolean(powerTypeToDelete)}
      onOpenChange={(val) =>
        dispatch(setPowerTypeToDelete(val ? powerTypeToDelete : null))
      }
    >
      <DialogHeader>
        <DialogTitle>Delete Power Type</DialogTitle>
        {/* Changed title to match delete purpose */}
        <DialogDescription>
          Are you sure you want to delete &nbsp;
          <strong className="text-primary">
            {capitalizeFirstLetter(powerTypeToDelete?.label)}
          </strong>
          ? This action cannot be undone.
        </DialogDescription>
        {/* Updated description to reflect delete action */}
      </DialogHeader>
      <DialogFooter>
        <Button variant="destructive" onClick={() => deletePowerType()}>
          <ProcessIndicator isProcessing={isPending} btnText="Confirm Delete" />
        </Button>
        <Button onClick={() => dispatch(setPowerTypeToDelete(null))}>
          Cancel
        </Button>
      </DialogFooter>
    </Modal>
  );
};

export default DeletePowerTypeModal;
