import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HERO_SEARCH_QUERY_KEYS } from "@/features/hero-search/query-keys";

type ReorderRow = { id: string; order: number };

const useReorderCategories = () => {
  const api = getApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: ReorderRow[]) => {
      const res = await api.patch(ENDPOINTS.admin.categories.reorder, rows);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({
        queryKey: HERO_SEARCH_QUERY_KEYS.categories,
      });
    },
    onError: (error: RequestError) => {
      toast({
        variant: "destructive",
        description: getErrorMessage(error),
      });
    },
  });
};

export default useReorderCategories;

