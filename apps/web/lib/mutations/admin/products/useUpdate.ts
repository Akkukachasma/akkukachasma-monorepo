import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetStore } from "@/store/products/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { formSchema } from "@/lib/validations/admin/product.validation";

const useUpdate = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();

  const product = useAppSelector((store) => store.productStore.formStore.data);
  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: Partial<z.infer<typeof formSchema>>) => {
      if (!product?.id) throw new Error("Product ID is required");

      const res = await api.put(
        ENDPOINTS.admin.products.update(product?.id),
        data,
      );
      return res.data;
    },
    onSuccess: (_data) => {
      dispatch(resetStore());
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

export default useUpdate;
