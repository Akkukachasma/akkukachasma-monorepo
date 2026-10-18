"use client";
import { Button, ProcessIndicator } from "../ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Modal from "../ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import useDelete from "@/lib/mutations/admin/newsletters/useDelete";
import { setItemToDelete } from "@/store/newsletters/data.slice";

const DeleteModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mutate: deleteItem, isPending } = useDelete();

  const itemToDelete = useAppSelector(
    (store) => store.newsletterStore.dataStore.itemToDelete,
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
        <DialogTitle>Remove subscriber</DialogTitle>
        <DialogDescription>
          Are you sure you want to remove&nbsp;
          <strong className="text-primary">{itemToDelete?.label}</strong>
          &nbsp;from WhatsApp updates? This cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="destructive" onClick={() => deleteItem()}>
          <ProcessIndicator isProcessing={isPending} btnText="Confirm remove" />
        </Button>
        <Button onClick={() => dispatch(setItemToDelete(null))}>Cancel</Button>
      </DialogFooter>
    </Modal>
  );
};

export default DeleteModal;
