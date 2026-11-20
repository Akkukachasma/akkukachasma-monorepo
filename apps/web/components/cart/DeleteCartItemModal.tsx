"use client";
import { Button, ProcessIndicator } from "@/components/ui/button";
import { DialogFooter, DialogHeaderWithClose } from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import useRemoveProductFromCart from "@/lib/mutations/cart/useRemoveProductFromCart";
import { setItemToDelete } from "@/store/cart.slice";

const DeleteCartItemModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mutate: deleteItem, isPending } = useRemoveProductFromCart();

  const itemToDelete = useAppSelector((store) => store.cartStore.itemToDelete);

  const handleDelete = () => {
    if (!itemToDelete?.id) return;
    deleteItem(itemToDelete.id);
  };

  return (
    <Modal
      showCloseIcon={false}
      open={Boolean(itemToDelete)}
      onOpenChange={(val) => {
        if (isPending) return;
        dispatch(setItemToDelete(val ? itemToDelete : null));
      }}
    >
      <DialogHeaderWithClose
        className="text-center sm:text-center"
        title="Remove Item From Cart"
        description="Are you sure you want to remove this item from your cart? This action cannot be undone."
      />
      <DialogFooter className="flex-col gap-3 sm:flex-row sm:gap-2 mt-1">
        <Button
          variant="destructive"
          disabled={isPending}
          onClick={handleDelete}
          className="w-full sm:w-auto"
        >
          <ProcessIndicator isProcessing={isPending} btnText="Confirm Delete" />
        </Button>
        <Button
          disabled={isPending}
          onClick={() => dispatch(setItemToDelete(null))}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
      </DialogFooter>
    </Modal>
  );
};

export default DeleteCartItemModal;
