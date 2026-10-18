"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options?: ComboboxOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  /**
    Only pass absolute width classes. This applies on both popover and the input box.
  */
  widthClass?: string;
}

const Combobox: React.FC<ComboboxProps> = ({
  onChange,
  options = [],
  value,
  placeholder = "Select an option",
  className = "",
  widthClass = "w-[200px]",
}) => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState("");

  const handleChange = (currentValue: string) => {
    const newValue = currentValue === selected ? "" : currentValue;
    setSelected(newValue);
    onChange(newValue);
    setOpen(false);
  };

  React.useEffect(() => {
    setSelected(value);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className, widthClass)}
        >
          {selected
            ? options.find((option) => option.value === selected)?.label
            : placeholder}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("p-0", widthClass)}>
        <Command>
          <CommandInput placeholder="Type here..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nothing found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => handleChange(currentValue)}
                >
                  {option.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      selected === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Combobox;
