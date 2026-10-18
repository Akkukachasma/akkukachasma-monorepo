"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useCallback } from "react";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export default function QuantityInput({
  value,
  onChange,
  min = 1,
  max = Infinity,
  disabled = false,
}: QuantityInputProps) {
  const increase = useCallback(() => {
    if (value < max) onChange(value + 1);
  }, [value, max, onChange]);

  const decrease = useCallback(() => {
    if (value > min) onChange(value - 1);
  }, [value, min, onChange]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={decrease}
        disabled={disabled || value <= min}
      >
        <Minus className="w-4 h-4" />
      </Button>

      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const val = Number(e.target.value);
          if (!isNaN(val) && val >= min && val <= max) onChange(val);
        }}
        disabled={disabled}
        className="w-16 text-center"
      />

      <Button
        variant="outline"
        size="icon"
        onClick={increase}
        disabled={disabled || value >= max}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
