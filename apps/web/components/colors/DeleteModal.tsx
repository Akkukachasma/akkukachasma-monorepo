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
import useDelete from "@/lib/mutations/admin/colors/useDelete";
import { setItemToDelete } from "@/store/colors/data.slice";

const DeleteModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mutate: deleteItem, isPending } = useDelete();

  // Accessing delete_modal from store
  const itemToDelete = useAppSelector(
    (store) => store.colorStore.dataStore.itemToDelete
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
        <DialogTitle>Delete colore</DialogTitle>
        {/* Changed title to match delete purpose */}
        <DialogDescription>
          <span className="break-words">
            Are you sure you want to delete &nbsp;
          </span>
          <span
            className="inline-block w-10 h-4 rounded"
            style={{ backgroundColor: itemToDelete?.label }}
          />
          <span className="break-words">
            &nbsp; ? This action cannot be undone.
          </span>
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
