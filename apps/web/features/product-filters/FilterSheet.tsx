"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { IProductResultFilters } from "@/store/product-results.slice";
import { ICategoryProductFilters } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFetchAvailableFilters } from "./useFetchAvailableFilters";
import type { ISearchParams } from "@/store/product-results.slice";
import { ChevronRight } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: string;
  initialSearchParams?: ISearchParams;
  initialFilters?: ICategoryProductFilters;
  currentFilters: IProductResultFilters;
  onApply: (filters: IProductResultFilters) => void;
}

const FilterSheet: React.FC<FilterSheetProps> = ({
  open,
  onOpenChange,
  endpoint,
  initialSearchParams,
  initialFilters,
  currentFilters,
  onApply,
}) => {
  const [shapeIds, setShapeIds] = useState<Set<string>>(
    new Set(currentFilters.shape_ids ?? [])
  );
  const [colorIds, setColorIds] = useState<Set<string>>(
    new Set(currentFilters.color_ids ?? [])
  );
  const [frameWidths, setFrameWidths] = useState<Set<number>>(
    new Set(currentFilters.frame_width ?? [])
  );
  const [lensWidths, setLensWidths] = useState<Set<number>>(
    new Set(currentFilters.lens_width ?? [])
  );
  const [frameSizes, setFrameSizes] = useState<Set<string>>(
    new Set(currentFilters.frame_size ?? [])
  );

  const pendingFilters: IProductResultFilters = {
    ...(shapeIds.size ? { shape_ids: Array.from(shapeIds) } : {}),
    ...(colorIds.size ? { color_ids: Array.from(colorIds) } : {}),
    ...(frameWidths.size ? { frame_width: Array.from(frameWidths) } : {}),
    ...(lensWidths.size ? { lens_width: Array.from(lensWidths) } : {}),
    ...(frameSizes.size ? { frame_size: Array.from(frameSizes) } : {}),
  };

  const { data: availableFilters, isLoading } = useFetchAvailableFilters(
    endpoint,
    pendingFilters,
    initialSearchParams,
    open
  );

  const filters: ICategoryProductFilters =
    availableFilters ?? initialFilters ?? {};

  useEffect(() => {
    if (!open) return;
    setShapeIds(new Set(currentFilters.shape_ids ?? []));
    setColorIds(new Set(currentFilters.color_ids ?? []));
    setFrameWidths(new Set(currentFilters.frame_width ?? []));
    setLensWidths(new Set(currentFilters.lens_width ?? []));
    setFrameSizes(new Set(currentFilters.frame_size ?? []));
  }, [currentFilters, open]);

  const buildFilters = (
    s: Set<string>,
    c: Set<string>,
    fw: Set<number>,
    lw: Set<number>,
    fs: Set<string>
  ): IProductResultFilters => {
    const out: IProductResultFilters = {};
    if (s.size) out.shape_ids = Array.from(s);
    if (c.size) out.color_ids = Array.from(c);
    if (fw.size) out.frame_width = Array.from(fw);
    if (lw.size) out.lens_width = Array.from(lw);
    if (fs.size) out.frame_size = Array.from(fs);
    return out;
  };

  const applyFilters = (
    s: Set<string>,
    c: Set<string>,
    fw: Set<number>,
    lw: Set<number>,
    fs: Set<string>
  ) => {
    setShapeIds(s);
    setColorIds(c);
    setFrameWidths(fw);
    setLensWidths(lw);
    setFrameSizes(fs);
    onApply(buildFilters(s, c, fw, lw, fs));
  };

  const toggleShape = (id: string) => {
    const next = new Set(shapeIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    applyFilters(next, colorIds, frameWidths, lensWidths, frameSizes);
  };

  const toggleColor = (id: string) => {
    const next = new Set(colorIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    applyFilters(shapeIds, next, frameWidths, lensWidths, frameSizes);
  };

  const toggleFrameWidth = (val: number) => {
    const next = new Set(frameWidths);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    applyFilters(shapeIds, colorIds, next, lensWidths, frameSizes);
  };

  const toggleLensWidth = (val: number) => {
    const next = new Set(lensWidths);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    applyFilters(shapeIds, colorIds, frameWidths, next, frameSizes);
  };

  const toggleFrameSize = (val: string) => {
    const next = new Set(frameSizes);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    applyFilters(shapeIds, colorIds, frameWidths, lensWidths, next);
  };

  const handleReset = () => {
    setShapeIds(new Set());
    setColorIds(new Set());
    setFrameWidths(new Set());
    setLensWidths(new Set());
    setFrameSizes(new Set());
    onApply({});
    onOpenChange(false);
  };

  const hasAnyFilter =
    shapeIds.size > 0 ||
    colorIds.size > 0 ||
    frameWidths.size > 0 ||
    lensWidths.size > 0 ||
    frameSizes.size > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent showCloseIcon={false} side="right" className="w-full flex flex-col gap-6 overflow-auto sm:max-w-sm border-none">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 py-6 overflow-auto pl-5">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading filters…</p>
          )}

          {/* Shape */}
          {filters?.shapes && filters.shapes.length > 0 && (
            <div className="space-y-3">
              <Label>Shape</Label>
              <div className="flex flex-col gap-2">
                {filters.shapes.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={shapeIds.has(s.id)}
                      onCheckedChange={() => toggleShape(s.id)}
                    />
                    <span className="text-sm">{s.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Frame size */}
          {filters?.frame_sizes && filters.frame_sizes.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Frame size</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.frame_sizes.map((fs) => (
                    <button
                      key={fs}
                      type="button"
                      onClick={() => toggleFrameSize(fs)}
                      className={cn(
                        "px-3 py-1.5 rounded-md border text-sm transition-colors",
                        frameSizes.has(fs)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:bg-accent"
                      )}
                    >
                      {fs.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Color (with swatch) */}
          {filters?.colors && filters.colors.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleColor(c.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors",
                        colorIds.has(c.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:bg-accent"
                      )}
                    >
                      <span
                        className="size-4 rounded-full border shrink-0"
                        style={{ backgroundColor: c.color || "#ccc" }}
                      />
                      {c.name
                        ? c.name.charAt(0).toUpperCase() + c.name.slice(1)
                        : c.color}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Frame width */}
          {filters?.frame_widths && filters.frame_widths.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Frame width (mm)</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.frame_widths.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => toggleFrameWidth(w)}
                      className={cn(
                        "px-3 py-1.5 rounded-md border text-sm transition-colors",
                        frameWidths.has(w)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:bg-accent"
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Lens width */}
          {filters?.lens_widths && filters.lens_widths.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Lens width (mm)</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.lens_widths.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => toggleLensWidth(w)}
                      className={cn(
                        "px-3 py-1.5 rounded-md border text-sm transition-colors",
                        lensWidths.has(w)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input hover:bg-accent"
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        {hasAnyFilter && (
          <SheetFooter className="flex-row gap-2 sm:gap-0 flex-shrink-0">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </SheetFooter>
        )}
        <DialogClose asChild>
          <Button type="button" className="absolute w-8 h-12 -left-2 top-1/2 -translate-y-1/2 px-0 py-0">
            <ChevronRight className="size-4" />
            <span className="sr-only">Close filters sheet</span>
          </Button>
        </DialogClose>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSheet;
