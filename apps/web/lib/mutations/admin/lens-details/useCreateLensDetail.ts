import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { lensDetailSchema } from "@/lib/validations/admin/lens-details.validation";
import { useAppDispatch } from "@/store";
import { showModal } from "@/store/lens-details/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const useCreateLensDetails = (onSuccess?: () => void) => {
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("lens_detail_image");
  const api = getApiClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof lensDetailSchema>) => {
      if (uploadedImage && uploadedImage.is_temp) {
        data.image = uploadedImage.id;
      }
      const res = await api.post(ENDPOINTS.admin.lens_details.create, data);
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(showModal(false));
      removeUploadedImageFromSession();
      if (onSuccess) onSuccess();
      queryClient.invalidateQueries({ queryKey: ["lens-details"] });
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

export default useCreateLensDetails;
