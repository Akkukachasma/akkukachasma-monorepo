"use client";

import React, { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PlusIcon from "@/components/icons/PlusIcon";
import { InputOption } from "@/lib/types";
import DefaultOptionTemplate from "./DefaultOptionTemplate";
import DefaultPreviewTemplate from "./DefaultPreviewTemplate";

export interface MultiSelectOption<T = any> extends InputOption {
  data?: T;
}
export interface OptionTemplateProps<T = any> extends MultiSelectOption<T> {
  onSelect: () => void;
}
export interface PreviewTemplateProps<T = any> extends MultiSelectOption<T> {
  onRemove: () => void;
}

interface MultiSelectInputProps<T = any> {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  options: MultiSelectOption<T>[];
  label?: string;
  id: string;
  optionTemplate?: React.FC<OptionTemplateProps<T>>;
  previewTemplate?: React.FC<PreviewTemplateProps<T>>;
  optionRef?: React.RefObject<HTMLDivElement>;
}

const MultiSelect: FC<MultiSelectInputProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  optionTemplate = DefaultOptionTemplate,
  previewTemplate = DefaultPreviewTemplate,
  optionRef,
}) => {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  const OptionTemplate = optionTemplate;
  const PreviewTemplate = previewTemplate;

  const handleSetValue = (val: string) => {
    let updatedTags: string[];
    if (!tags.includes(val)) {
      updatedTags = [...tags, val];
      setTags(updatedTags);
      onChange(updatedTags);
    }
    setOpen(false);
  };

  const handleTagRemove = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    onChange(updatedTags);
  };

  useEffect(() => {
    if (Array.isArray(value)) {
      setTags(value);
    }
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {label && (
        <label htmlFor={id} className="mb-2 block font-medium">
          {label}
        </label>
      )}
      <div className="flex gap-2 flex-wrap justify-start w-full mb-2">
        {tags.map((tag) => {
          const option = options.find((option) => option.value === tag);
          return (
            <PreviewTemplate
              key={tag}
              {...option}
              onRemove={() => handleTagRemove(tag)}
            />
          );
        })}
      </div>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-fit justify-between shadow-lg shadow-input"
        >
          <span className="text-sm font-normal text-secondary-foreground/70">
            Select...
          </span>
          <PlusIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="h-fit p-0">
        <Command>
          <CommandGroup>
            <CommandList>
              {options.map((option) => (
                <CommandItem
                  id={id}
                  key={option.value}
                  value={option.value}
                  asChild
                >
                  <OptionTemplate
                    ref={optionRef}
                    onSelect={() => handleSetValue(option.value || "")}
                    {...option}
                  />
                  {/* {option.label} */}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelect;
