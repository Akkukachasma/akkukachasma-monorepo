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
import useDelete from "@/lib/mutations/admin/coupon-manager/useDelete";
import { setItemToDelete } from "@/store/coupon-manager/data.slice";

const DeleteModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mutate: deleteItem, isPending } = useDelete();

  // Accessing delete_modal from store
  const itemToDelete = useAppSelector(
    (store) => store.couponStore.dataStore.itemToDelete,
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
        <DialogTitle>Delete Coupon</DialogTitle>
        {/* Changed title to match delete purpose */}
        <DialogDescription>
          Are you sure you want to delete &nbsp;
          <strong className="text-primary uppercase">
            {itemToDelete?.label}
          </strong>
          ? This action cannot be undone.
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
