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
import { setItemToDelete } from "@/store/checkout.slice";
import useRemoveOrderItem from "@/lib/mutations/order/useRemoveOrderItem";

const DeleteOrderItemModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mutate: deleteItem, isPending } = useRemoveOrderItem();

  // Accessing delete_modal from store
  const itemToDelete = useAppSelector(
    (store) => store.checkoutStore.itemToDelete,
  );

  return (
    <Modal
      showCloseIcon
      open={Boolean(itemToDelete)}
      onOpenChange={(open) => {
        if (!open) dispatch(setItemToDelete(null));
      }}
    >
      <DialogHeader>
        <DialogTitle>Remove Item From Cart</DialogTitle>
        {/* Changed title to match delete purpose */}
        <DialogDescription>
          Are you sure you want to remove this item from your order? This action
          cannot be undone.
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

export default DeleteOrderItemModal;
