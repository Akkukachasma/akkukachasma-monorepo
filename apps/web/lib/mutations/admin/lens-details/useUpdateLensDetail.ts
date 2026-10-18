import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { lensDetailSchema } from "@/lib/validations/admin/lens-details.validation";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetStore } from "@/store/lens-details/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const useUpdateLensDetail = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("lens_detail_image");

  const lens_detail_id = useAppSelector(
    (store) => store.lensDetailStore.formStore.lens_detail_id,
  );

  const api = getApiClient();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof lensDetailSchema>) => {
      if (uploadedImage && uploadedImage.is_temp) {
        data.image = uploadedImage.id;
      }
      const res = await api.put(
        ENDPOINTS.admin.lens_details.update(lens_detail_id),
        data,
      );
      return res.data;
    },
    onSuccess: (_data) => {
      dispatch(resetStore());
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

export default useUpdateLensDetail;
