"use client";
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { IAddress } from "@/components/account/addresses/Address";

interface AddressSelectorProps {
  addresses: IAddress[];
  selectedId: string;
  onChange: (id: string) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedId,
  onChange,
}) => {
  return (
    <RadioGroup
      value={selectedId}
      onValueChange={onChange}
      className="grid gap-4"
    >
      {addresses.map((address) => (
        <Card
          key={address.id}
          className={cn(
            "transition-all duration-200 hover:shadow-hover cursor-pointer border-muted",
            selectedId === address.id && "border-primary ring-2 ring-ring",
          )}
        >
          <CardContent className="p-4">
            <RadioGroupItem
              id={address.id}
              value={address.id}
              className="hidden"
            />
            <Label
              htmlFor={address.id}
              className="flex flex-col gap-1 cursor-pointer w-full"
            >
              <div className="font-medium text-base capitalize">
                {address.label}
              </div>
              <p className="text-sm font-normal">
                {address.address}, {address.city}, {address.state},{" "}
                {address.country}, {address.zip_code}
              </p>
              <p className="text-xs font-normal text-gray-400">
                NOTE: <i>{address.notes}</i>
              </p>
            </Label>
          </CardContent>
        </Card>
      ))}
    </RadioGroup>
  );
};
export default AddressSelector;
