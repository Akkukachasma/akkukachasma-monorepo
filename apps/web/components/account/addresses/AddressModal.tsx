"use client";

import Modal from "@/components/ui/modal";
import AddressForm from "./AddressForm";
import { useAppSelector, useAppDispatch } from "@/store";
import { setAddressModal } from "@/store/account.slice";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

const AddressModal = () => {
  const dispatch = useAppDispatch();
  const addressModal = useAppSelector(
    (store) => store.accountStore.addressModal,
  );
  const editingAddress = useAppSelector(
    (store) => store.accountStore.editingAddress,
  );
  const isEditing = Boolean(editingAddress);

  const handleClose = (val: boolean) => {
    dispatch(setAddressModal(val));
  };

  return (
    <Modal
      open={addressModal}
      onOpenChange={(val) => handleClose(val)}
      className="max-w-lg sm:max-w-xl"
    >
      <div className="mb-5 space-y-1">
        <DialogTitle className="text-xl font-semibold tracking-tight">
          {isEditing ? "Edit delivery address" : "Add delivery address"}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Used at checkout so your order reaches the right place.
        </DialogDescription>
      </div>
      <AddressForm key={editingAddress?.id ?? "create"} />
    </Modal>
  );
};

export default AddressModal;
