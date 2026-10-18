"use client";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { showEditPlaceOrder } from "@/store/placed-order/modal.slice";
import { useAppDispatch, useAppSelector } from "@/store";

const EditPlaceOrderModel: React.FC = () => {
  const dispatch = useAppDispatch();
  const edit_modal = useAppSelector(
    (store) => store.placeOrderStore.modalStore.edit_modal,
  );

  return (
    <Modal
      open={edit_modal}
      onOpenChange={(val) => dispatch(showEditPlaceOrder(val))}
    >
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Username
          </Label>
          <Input
            id="username"
            defaultValue="@peduarte"
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch(showEditPlaceOrder(false))}
        >
          Cancel
        </Button>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </Modal>
  );
};

export default EditPlaceOrderModel;
