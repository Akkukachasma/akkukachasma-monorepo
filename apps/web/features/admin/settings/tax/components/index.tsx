"use client";

import { Button } from "@/components/ui/button";
import useTaxes from "../queries/useTaxes";
import { Plus } from "lucide-react";
import TaxCard from "./TaxCard";
import { useAppDispatch } from "@/store";
import { setDialog } from "../store/ui.slice";

const Tax = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useTaxes();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 h-full gap-4 p-2">
        <Button variant="outline" className="h-44 rounded-xl">
          <Plus className="size-4" />
        </Button>
        {Array(5)
          .fill(null)
          .map((_, index) => (
            <TaxCard key={index} />
          ))}
      </div>
    );
  }

  if (!Array.isArray(data)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 h-full gap-4 p-2">
        <Button
          onClick={() => dispatch(setDialog(true))}
          variant="outline"
          className="h-44 rounded-xl"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
      <Button
        onClick={() => dispatch(setDialog(true))}
        variant="outline"
        className="h-44 rounded-xl"
      >
        <Plus className="size-4" />
      </Button>
      {data.map((tax) => (
        <TaxCard key={tax.id} data={tax} />
      ))}
    </div>
  );
};

export default Tax;
