import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "@/lib/hooks/use-toast";
import {
  fetchRelatedShapeSlides,
  getErrorMessage,
  type RequestError,
} from "../services/related-shape-products.service";
import { PRODUCT_QUERY_KEYS } from "../query-keys";

export interface UseRelatedShapeProductsParams {
  shapeSlug?: string;
  excludeProductColorId?: string;
  shapeTitle?: string;
}

export function useRelatedShapeProducts({
  shapeSlug,
  excludeProductColorId,
  shapeTitle,
}: UseRelatedShapeProductsParams) {
  const enabled = Boolean(shapeSlug);

  const result = useQuery({
    queryKey: PRODUCT_QUERY_KEYS.relatedShapeProducts(
      shapeSlug,
      excludeProductColorId,
    ),
    queryFn: () =>
      fetchRelatedShapeSlides({
        shapeSlug: shapeSlug!,
        excludeProductColorId,
        shapeTitle,
      }),
    enabled,
    staleTime: 30_000,
    retry: 1,
  });

  useEffect(() => {
    if (result.isError && enabled) {
      const message = getErrorMessage(result.error as RequestError);
      toast({
        description: message || "Failed to load related products",
        variant: "destructive",
      });
    }
  }, [result.isError, result.error, enabled]);

  return {
    slides: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
