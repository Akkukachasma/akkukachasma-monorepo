"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "@/lib/hooks/use-toast";
import {
  fetchRelatedBanners,
  getErrorMessage,
  RequestError,
} from "../services/related-banners.service";
import { PRODUCT_QUERY_KEYS } from "../query-keys";

export interface UseRelatedBannersParams {
  categoryId?: string;
  shapeId?: string;
}

export function useRelatedBanners({
  categoryId,
  shapeId,
}: UseRelatedBannersParams) {
  const hasParams = Boolean(categoryId || shapeId);

  const result = useQuery({
    queryKey: PRODUCT_QUERY_KEYS.relatedBanners(categoryId, shapeId),
    queryFn: () =>
      fetchRelatedBanners({ categoryId, shapeId }),
    enabled: hasParams,
    staleTime: 30_000,
    retry: 1,
  });

  useEffect(() => {
    if (result.isError && hasParams) {
      const message = getErrorMessage(result.error as RequestError);
      toast({
        description: message || "Failed to load related banners",
        variant: "destructive",
      });
    }
  }, [result.isError, result.error, hasParams]);

  return {
    banners: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
