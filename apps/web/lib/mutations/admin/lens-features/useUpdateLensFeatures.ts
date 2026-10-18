import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { lensFeatureSchema } from "@/lib/validations/admin/lens-feature.validation";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetStore } from "@/store/lens-features/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const useUpdateLensFeature = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("lens_feature_image");
  const lens_feature_id = useAppSelector(
    (store) => store.lensFeatureStore.formStore.lens_feature_id,
  );

  const api = getApiClient({ multipart: true });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof lensFeatureSchema>) => {
      if (uploadedImage && uploadedImage.is_temp) {
        data.image = uploadedImage.id;
      }
      const res = await api.put(
        ENDPOINTS.admin.lens_features.update(lens_feature_id),
        data,
      );
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(resetStore());
      toast({
        description: data.message,
        variant: "success",
      });
      if (onSuccess) onSuccess();
      if (uploadedImage?.is_temp) removeUploadedImageFromSession();
      queryClient.invalidateQueries({ queryKey: ["lens-features"] });
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

export default useUpdateLensFeature;
