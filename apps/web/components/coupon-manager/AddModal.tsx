"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { showModal } from "@/store/coupon-manager/form.slice";
import CouponForm from "./CouponForm";

const AddModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((store) => store.couponStore.formStore.modal);

  return (
    <Modal
      showCloseIcon
      open={modal}
      onOpenChange={(val) => dispatch(showModal(val))}
      className="max-w-[45rem]"
    >
      <DialogHeader>
        <DialogTitle>Add Coupon</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new coupon.
        </DialogDescription>
      </DialogHeader>
      <CouponForm />
    </Modal>
  );
};
export default AddModal;
