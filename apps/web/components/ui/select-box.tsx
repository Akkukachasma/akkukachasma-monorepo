"use client";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";
import React from "react";
import { InputOption } from "@/lib/types";

interface ISelectProps {
  options: Array<InputOption | string | number>;
  placeholder: string;
  onChange: (value: string) => void;
  value: string;
  className?: string;
  wrapperClass?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}

const SelectBox: React.FC<ISelectProps> = ({
  options,
  placeholder,
  onChange,
  value,
  className = "",
  wrapperClass = "",
  error = "",
  disabled = false,
  id,
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={(value) => {
        if (value) onChange(value);
      }}
      disabled={disabled}
    >
      <div className={cn("flex flex-col w-[200px]", wrapperClass)}>
        <SelectTrigger
          className={cn(
            "w-full shadow-lg shadow-input text-xs font-medium text-secondary-foreground",
            className,
            error && "border-destructive text-destructive"
          )}
          id={id}
          open={open}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {error && <small className="text-destructive mt-1">{error}</small>}
      </div>
      <SelectContent>
        {options.map((option) => {
          if (typeof option === "string" || typeof option === "number") {
            return (
              <SelectItem
                key={option.toString()}
                value={option.toString()}
                className="text-xs text-secondary-foreground font-medium"
              >
                {option.toString()}
              </SelectItem>
            );
          } else {
            return (
              <SelectItem
                key={option.value}
                value={option.value || ""}
                className="text-xs text-secondary-foreground font-medium"
              >
                {option.label}
              </SelectItem>
            );
          }
        })}
        {options?.length < 1 && (
          <div className="h-20 text-muted-foreground w-full text-xs font-medium grid place-content-center">
            No options
          </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default SelectBox;
