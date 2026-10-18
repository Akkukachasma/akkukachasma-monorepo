import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { lensFeatureSchema } from "@/lib/validations/admin/lens-feature.validation";
import { useAppDispatch } from "@/store";
import { resetStore } from "@/store/lens-features/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const useCreateLensFeature = (onSuccess?: () => void) => {
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("lens_feature_image");
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof lensFeatureSchema>) => {
      if (uploadedImage) {
        data.image = uploadedImage.id;
      }
      const res = await api.post(ENDPOINTS.admin.lens_features.create, data);
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(resetStore());
      toast({
        description: data.message,
        variant: "success",
      });
      removeUploadedImageFromSession();
      if (onSuccess) onSuccess();
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

export default useCreateLensFeature;
