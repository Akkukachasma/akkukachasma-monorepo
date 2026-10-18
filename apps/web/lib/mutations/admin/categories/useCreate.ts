import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch } from "@/store";
import { resetStore } from "@/store/categories/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { formSchema } from "@/lib/validations/admin/categories.validation";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";
import { HERO_SEARCH_QUERY_KEYS } from "@/features/hero-search/query-keys";

const useCreate = (onSuccess?: () => void) => {
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("category_image");
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (
      data: z.infer<typeof formSchema> & { image?: string },
    ) => {
      if (uploadedImage) {
        data.image = uploadedImage.id;
      }
      const res = await api.post(ENDPOINTS.admin.categories.create, data);
      return res.data;
    },
    onSuccess: () => {
      dispatch(resetStore());
      if (onSuccess) onSuccess();
      removeUploadedImageFromSession();
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({
        queryKey: HERO_SEARCH_QUERY_KEYS.categories,
      });
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
