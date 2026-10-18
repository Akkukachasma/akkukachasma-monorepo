import { capitalizeFirstLetter } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
import React, { FC } from "react";

interface SelectedProps {
  label: string;
  onClose: () => void;
}

const Selected: FC<SelectedProps> = ({ label, onClose }) => {
  return (
    <div className="rounded-xl text-xs bg-primary/20 text-primary  px-2 py-1 flex items-center gap-2">
      <span>{capitalizeFirstLetter(label)}</span>
      <button
        onClick={() => onClose()}
        type="button"
        className="w-fit h-fit p-0 grid place-content-center"
      >
        <Cross2Icon className="size-3" />
      </button>
    </div>
  );
};

export default Selected;
