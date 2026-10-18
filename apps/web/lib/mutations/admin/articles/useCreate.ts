import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch } from "@/store";
import { resetStore } from "@/store/articles/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { formSchema } from "@/lib/validations/admin/articles.validation";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const useCreate = (onSuccess?: () => void) => {
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("article_image");
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (
      data: z.infer<typeof formSchema> & { thumbnail?: string },
    ) => {
      if (uploadedImage) {
        data.thumbnail = uploadedImage.id;
      }
      const res = await api.post(ENDPOINTS.admin.articles.create, data);
      return res.data;
    },
    onSuccess: () => {
      dispatch(resetStore());
      if (onSuccess) onSuccess();
      removeUploadedImageFromSession();
      queryClient.invalidateQueries({ queryKey: ["articles"] });
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
