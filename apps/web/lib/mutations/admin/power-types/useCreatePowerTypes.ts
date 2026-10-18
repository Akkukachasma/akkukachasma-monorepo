import { toast } from "@/lib/hooks/use-toast";
import { RequestError, getApiClient, getErrorMessage } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { powerTypeSchema } from "@/lib/validations/admin/power-type.validation";
import { useAppDispatch } from "@/store";
import { showModal } from "@/store/power-types/form.slice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const useCreatePowerType = (onSuccess?: () => void) => {
  const api = getApiClient();
  const { value: uploadedImage, removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("power_type_image");
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (
      data: z.infer<typeof powerTypeSchema> & { image?: string },
    ) => {
      if (uploadedImage) {
        data.image = uploadedImage.id;
      }
      const res = await api.post(ENDPOINTS.admin.power_types.create, data);
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(showModal(false));
      if (onSuccess) onSuccess();
      removeUploadedImageFromSession();
      queryClient.invalidateQueries({ queryKey: ["power-types"] });
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

export default useCreatePowerType;
