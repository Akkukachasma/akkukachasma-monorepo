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
import useRemoveProductFromCart from "@/lib/mutations/cart/useRemoveProductFromCart";
import { setItemToDelete } from "@/store/cart.slice";

const DeleteCartItemModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mutate: deleteItem, isPending } = useRemoveProductFromCart();

  // Accessing delete_modal from store
  const itemToDelete = useAppSelector((store) => store.cartStore.itemToDelete);

  return (
    <Modal
      showCloseIcon
      open={Boolean(itemToDelete)}
      onOpenChange={(val) =>
        dispatch(setItemToDelete(val ? itemToDelete : null))
      }
    >
      <DialogHeader>
        <DialogTitle>Remove Item From Cart</DialogTitle>
        {/* Changed title to match delete purpose */}
        <DialogDescription>
          Are you sure you want to remove this item from your cart? This action
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

export default DeleteCartItemModal;
