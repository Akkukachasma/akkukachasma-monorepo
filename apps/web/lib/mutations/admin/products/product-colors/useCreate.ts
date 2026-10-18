import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { productColorSchema } from "@/lib/validations/admin/product.validation";
import { resetStore } from "@/store/products/product-color.slice";

const useCreate = (product_id: string, onSuccess?: () => void) => {
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof productColorSchema>) => {
      const res = await api.post(
        ENDPOINTS.admin.products.color.create(product_id),
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      dispatch(resetStore()); // commenting becuase we don't want to close the modal.
      if (onSuccess) onSuccess();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: RequestError) => {
      const message = getErrorMessage(error);
      toast({
        variant: "destructive",
        description: message,
      });
    },
  });
  return mutation;
};

export default useCreate;
