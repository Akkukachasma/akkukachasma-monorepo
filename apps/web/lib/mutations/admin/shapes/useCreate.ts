import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch } from "@/store";
import { resetStore } from "@/store/shapes/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { formSchema } from "@/lib/validations/admin/shapes.validation";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";
import { HERO_SEARCH_QUERY_KEYS } from "@/features/hero-search/query-keys";

const useCreate = (onSuccess?: () => void) => {
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("shape_image");
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (uploadedImage) {
        data.image = uploadedImage.id;
      }
      const res = await api.post(ENDPOINTS.admin.shapes.create, data);
      return res.data;
    },
    onSuccess: () => {
      dispatch(resetStore());
      removeUploadedImageFromSession();
      if (onSuccess) onSuccess();
      queryClient.invalidateQueries({ queryKey: ["shapes"] });
      queryClient.invalidateQueries({
        queryKey: HERO_SEARCH_QUERY_KEYS.shapes,
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
