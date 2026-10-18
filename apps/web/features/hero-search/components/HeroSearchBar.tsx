"use client";

import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoriesForHero } from "../queries/useCategoriesForHero";
import { useShapesForHero } from "../queries/useShapesForHero";
import { HeroMediaRenderer } from "@/components/home/hero-media-renderer";
import { getErrorMessage } from "@/lib/api";
import type { RequestError } from "@/lib/api";
import { toast } from "@/lib/hooks/use-toast";

const buildSearchUrl = (params: {
  gender?: string;
  category_slug?: string;
  shape_slug?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params.gender) searchParams.set("gender", params.gender);
  if (params.category_slug)
    searchParams.set("category_slug", params.category_slug);
  if (params.shape_slug) searchParams.set("shape_slug", params.shape_slug);
  const qs = searchParams.toString();
  return qs ? `/search?${qs}` : "/search";
};

const HeroSearchBar: React.FC = () => {
  const router = useRouter();
  const [gender, setGender] = React.useState("__none__");
  const [categorySlug, setCategorySlug] = React.useState("__none__");
  const [shapeSlug, setShapeSlug] = React.useState("__none__");

  const {
    data: categories = [],
    isError: categoriesError,
    error: categoriesErrorObj,
  } = useCategoriesForHero();

  const {
    data: shapes = [],
    isError: shapesError,
    error: shapesErrorObj,
  } = useShapesForHero();

  useEffect(() => {
    if (categoriesError && categoriesErrorObj) {
      toast({
        title: "Failed to load categories",
        description: getErrorMessage(categoriesErrorObj as RequestError),
        variant: "destructive",
      });
    }
  }, [categoriesError, categoriesErrorObj]);

  useEffect(() => {
    if (shapesError && shapesErrorObj) {
      toast({
        title: "Failed to load shapes",
        description: getErrorMessage(shapesErrorObj as RequestError),
        variant: "destructive",
      });
    }
  }, [shapesError, shapesErrorObj]);

  const handleSearch = useCallback(() => {
    router.push(
      buildSearchUrl({
        gender: gender && gender !== "__none__" ? gender : undefined,
        category_slug:
          categorySlug && categorySlug !== "__none__"
            ? categorySlug
            : undefined,
        shape_slug:
          shapeSlug && shapeSlug !== "__none__" ? shapeSlug : undefined,
      })
    );
  }, [router, gender, categorySlug, shapeSlug]);

  return (
    <div className="relative min-h-96 px-4 py-8">
      <HeroMediaRenderer />

      <div className="absolute inset-0 z-[2] grid place-content-center bg-black/50">
        <div className="flex bg-primary-foreground flex-col border-2 border-primary overflow-hidden sm:flex-row gap-2 sm:gap-0 items-stretch sm:items-center max-w-4xl mx-auto w-full">
          <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-0 w-full sm:w-auto">
            <Select value={categorySlug} onValueChange={setCategorySlug}>
              <SelectTrigger className="h-11 sm:h-12 rounded-none min-w-[160px] border-none shadow-none">
                <SelectValue placeholder="Choose Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Choose Category</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={shapeSlug} onValueChange={setShapeSlug}>
              <SelectTrigger className="h-11 sm:h-12 rounded-none min-w-[160px] border-none shadow-none">
                <SelectValue placeholder="Choose Shape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Choose Shape</SelectItem>
                {shapes.map((s) => (
                  <SelectItem key={s.id} value={s.slug}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleSearch}
            variant="success"
            className="h-11 sm:h-12 rounded-none px-6 shrink-0"
          >
            Search
          </Button>
        </div>

      </div>

    </div>
  );
};

export default HeroSearchBar;
