"use client";
import React from "react";
import Modal, { ModalProps } from "@/components/ui/modal";
import { DialogTitle } from "@/components/ui/dialog";
import AddressSelector from "./address-selector";
import useAddresses from "@/lib/queries/account/useAddresses";
import { IAddress } from "@/components/account/addresses/Address";
import PlusIcon from "@/components/icons/PlusIcon";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { openCreateAddressModal } from "@/store/account.slice";
interface SelectAddressModalProps extends Omit<ModalProps, "children"> {
  address?: IAddress;
  setAddress?: (address: IAddress) => void;
}

const SelectAddressModal: React.FC<SelectAddressModalProps> = ({
  open,
  onOpenChange,
  address,
  setAddress,
}) => {
  const [selectedId, setSelectedId] = React.useState<string>("");
  const { data: addresses } = useAddresses();
  const dispatch = useAppDispatch();

  const handleIdChange = (id: string) => {
    setSelectedId(id);
    if (setAddress) {
      const selectedAddress = addresses.find((addr) => addr.id === id);
      if (selectedAddress) {
        setAddress(selectedAddress);
      }
    }
  };

  React.useEffect(() => {
    if (address) {
      setSelectedId(address.id);
    }
  }, [address]);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="flex items-center justify-between pr-12">
        <span>Select Address</span>
        <Button
          onClick={() => dispatch(openCreateAddressModal())}
          size="icon"
          variant="outline"
        >
          <PlusIcon />
        </Button>
      </DialogTitle>
      <AddressSelector
        addresses={addresses}
        selectedId={selectedId}
        onChange={(id) => handleIdChange(id)}
      />
    </Modal>
  );
};
export default SelectAddressModal;
