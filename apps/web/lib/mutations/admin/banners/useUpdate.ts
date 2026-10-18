import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetStore } from "@/store/banners/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { formSchema } from "@/lib/validations/admin/banners.validation";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const useUpdate = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const { value: uploadedImage, setValue: setUploadedImage } =
    useSessionStorage<IFile>("banner_image");
  const storedData = useAppSelector(
    (store) => store.bannerStore.formStore.data,
  );

  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (
      data: z.infer<typeof formSchema> & { image?: string },
    ) => {
      if (!storedData?.id) throw new Error("Banner ID is required");
      if (uploadedImage && uploadedImage.is_temp) {
        data.image = uploadedImage.id;
      }
      const res = await api.put(
        ENDPOINTS.admin.banners.update(storedData?.id || ""),
        data,
      );
      return res.data;
    },
    onSuccess: (_data) => {
      dispatch(resetStore());
      if (onSuccess) onSuccess();
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({
        queryKey: ["products", "related-banners"],
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

export default useUpdate;
