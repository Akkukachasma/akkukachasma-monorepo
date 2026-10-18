"use client";
import React from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { IColor } from "../colors/ListItem";
import { getColorName } from "@/lib/hooks/useColorName";
interface ColorSwitcherProps {
  colors?: Array<IColor[]>;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const ColorSwitcher: React.FC<ColorSwitcherProps> = ({
  colors = [],
  onChange,
  value = "",
  className = "",
}) => {
  const handleChange = (val: string) => {
    onChange?.(val);
  };

  return (
    <RadioGroup
      value={value}
      onValueChange={handleChange}
      className={cn("flex items-center gap-2", className)}
    >
      {colors.map((color) => {
        const colorValue = getColorName(color);
        return (
          <div key={colorValue} className="flex items-center">
            <RadioGroupItem value={colorValue} id={colorValue} className="peer sr-only" />
            <Label
              htmlFor={colorValue}
              className={cn(
                "h-8 w-8 rounded-full flex flex-col overflow-hidden border border-gray-200 cursor-pointer ring-offset-background transition-all hover:scale-110",
                "peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-offset-2",
                "peer-data-[state=checked]:ring-black",
              )}
            >
              {color?.map((c) => {
                return (
                  <span
                    key={c.id}
                    className="size-full inline-block"
                    style={{ backgroundColor: c.color }}
                  />
                );
              })}
              <span className="sr-only">{colorValue}</span>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
};

export default ColorSwitcher;
