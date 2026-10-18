"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useGetTryAtHomePurposes from "../queries/useGetTryAtHomePurposes";

interface PurposeSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const PurposeSelect: React.FC<PurposeSelectProps> = ({
  value,
  onChange,
  placeholder = "Select purpose",
}) => {
  const { data: purposes, isLoading } = useGetTryAtHomePurposes();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Loading purposes...
          </SelectItem>
        ) : purposes?.length === 0 ? (
          <SelectItem value="none" disabled>
            No purposes available
          </SelectItem>
        ) : (
          purposes?.map((purpose) => (
            <SelectItem key={purpose.id} value={purpose.id}>
              {purpose.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default PurposeSelect;
